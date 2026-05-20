const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authVerify = require('../middleware/authVerify');

// ==========================================
// 1. FETCH ALL BORROW LOGS
// ==========================================
router.get('/borrow-logs', authVerify, async (req, res) => {
  try {
    const sql = `
      SELECT b.*, m.FullName as MemberName, bk.Title as BookTitle, r.ReturnedDate, r.Fine, r.ConditionStatus
      FROM borrow b
      LEFT JOIN members m ON b.MemberId = m.MemberId
      LEFT JOIN books bk ON b.BookId = bk.BookId
      LEFT JOIN returns r ON b.BorrowId = r.BorrowId
      ORDER BY b.BorrowId DESC
    `;
    const [logs] = await db.query(sql);
    return res.status(200).json({ data: logs });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error retrieving system transactional logs.' });
  }
});

// ==========================================
// 2. INITIALIZE BORROW TRANSACTION
// ==========================================
router.post('/borrow', authVerify, async (req, res) => {
  const { memberId, bookId, returnDate, quantity = 1 } = req.body;

  if (!memberId || !bookId || !returnDate) {
    return res.status(400).json({ message: 'Missing parameters: memberId, bookId, and returnDate are mandatory.' });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [books] = await connection.query('SELECT Quantity FROM books WHERE BookId = ? FOR UPDATE', [bookId]);
    if (books.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Target book record not found.' });
    }

    if (books[0].Quantity < quantity) {
      await connection.rollback();
      return res.status(400).json({ message: 'Insufficient inventory available.' });
    }

    await connection.query('UPDATE books SET Quantity = Quantity - ? WHERE BookId = ?', [quantity, bookId]);

    const insertSql = `
      INSERT INTO borrow (MemberId, BookId, BorrowDate, ReturnDate, Quantity, Status)
      VALUES (?, ?, CURDATE(), ?, ?, 'Borrowed')
    `;
    const [result] = await connection.query(insertSql, [memberId, bookId, returnDate, quantity]);

    await connection.commit();
    return res.status(201).json({ message: 'Loan transaction completed successfully.', borrowId: result.insertId });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    return res.status(500).json({ message: 'Transaction rolled back due to error processing item loan.' });
  } finally {
    connection.release();
  }
});

// ==========================================
// 3. WORKFLOW PROCESSING FOR RETURN ENTRIES
// ==========================================
router.post('/return', authVerify, async (req, res) => {
  const { borrowId, fine = 0, conditionStatus = 'Good' } = req.body;

  if (!borrowId) {
    return res.status(400).json({ message: 'BorrowId target trace reference is mandatory.' });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [borrows] = await connection.query('SELECT * FROM borrow WHERE BorrowId = ? AND Status = "Borrowed" FOR UPDATE', [borrowId]);
    if (borrows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'No unresolved borrow entries located for this reference ID.' });
    }

    const borrowRecord = borrows[0];

    await connection.query('UPDATE borrow SET Status = "Returned" WHERE BorrowId = ?', [borrowId]);
    await connection.query('UPDATE books SET Quantity = Quantity + ? WHERE BookId = ?', [borrowRecord.Quantity, borrowRecord.BookId]);

    const insertReturnSql = `
      INSERT INTO returns (BorrowId, ReturnedDate, Fine, ConditionStatus)
      VALUES (?, CURDATE(), ?, ?)
    `;
    await connection.query(insertReturnSql, [borrowId, fine, conditionStatus]);

    await connection.commit();
    return res.status(200).json({ message: 'Book catalog item check-in handled smoothly.' });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    return res.status(500).json({ message: 'Transaction rolled back due to failure updating catalog status logs.' });
  } finally {
    connection.release();
  }
});

// ==========================================
// 4. CLEAN & TIME-FILTERED REPORTS SUMMARY (Deduplicated)
// ==========================================
router.get('/reports-summary', authVerify, async (req, res) => {
  const { range } = req.query;
  
  // Scopes dynamic calculation boundaries based on creation timestamps
  let fineConstraintSQL = "";
  if (range === 'daily') {
    fineConstraintSQL = "WHERE ReturnedDate >= NOW() - INTERVAL 1 DAY";
  } else if (range === 'weekly') {
    fineConstraintSQL = "WHERE ReturnedDate >= NOW() - INTERVAL 7 DAY";
  } else if (range === 'monthly') {
    fineConstraintSQL = "WHERE ReturnedDate >= NOW() - INTERVAL 30 DAY";
  }

  try {
    // Totals metrics
    const [[{ totalBooks }]] = await db.query('SELECT SUM(Quantity) AS totalBooks FROM books');
    const [[{ totalMembers }]] = await db.query('SELECT COUNT(*) AS totalMembers FROM members');
    const [[{ activeLoans }]] = await db.query('SELECT COUNT(*) AS activeLoans FROM borrow WHERE Status = "Borrowed"');
    
    // Uses the conditional syntax calculated above to evaluate financial performance blocks
    const [[{ totalFines }]] = await db.query(`SELECT SUM(Fine) AS totalFines FROM returns ${fineConstraintSQL}`);

    // Inventory category map distributions
    const [categoryDistribution] = await db.query(`
      SELECT c.CategoryName, COUNT(b.BookId) AS BookCount, IFNULL(SUM(b.Quantity), 0) AS TotalStock
      FROM categories c
      LEFT JOIN books b ON c.CategoryId = b.CategoryId
      GROUP BY c.CategoryId
    `);

    // Flag critical overdue line files
    const [overdueItems] = await db.query(`
      SELECT b.BorrowId, m.FullName AS MemberName, bk.Title AS BookTitle, DATE_FORMAT(b.ReturnDate, '%Y-%m-%d') as ReturnDate
      FROM borrow b
      JOIN members m ON b.MemberId = m.MemberId
      JOIN books bk ON b.BookId = bk.BookId
      WHERE b.Status = 'Borrowed' AND b.ReturnDate < CURDATE()
      ORDER BY b.ReturnDate ASC
    `);

    return res.status(200).json({
      summary: {
        totalBooks: totalBooks || 0,
        totalMembers: totalMembers || 0,
        activeLoans: activeLoans || 0,
        totalFinesCollected: totalFines || 0
      },
      categoryDistribution,
      overdueItems
    });
  } catch (err) {
    console.error('Error compiling reports metrics:', err);
    return res.status(500).json({ message: 'Internal server error compiling analytics data.' });
  }
});

// ==========================================
// 5. MEMBER PROFILE LOANS LIST
// ==========================================
router.get('/my-loans', authVerify, async (req, res) => {
  try {
    const memberId = req.user.userId; 

    const [myLogs] = await db.query(`
      SELECT b.BorrowId, bk.Title, b.BorrowDate, b.ReturnDate, b.Status, r.Fine, r.ReturnedDate
      FROM borrow b
      JOIN books bk ON b.BookId = bk.BookId
      LEFT JOIN returns r ON b.BorrowId = r.BorrowId
      WHERE b.MemberId = ?
      ORDER BY b.BorrowDate DESC
    `, [memberId]);

    return res.status(200).json({ data: myLogs });
  } catch (err) {
    return res.status(500).json({ message: 'Server error retrieving your records.' });
  }
});

// ==========================================
// 6. PROCESS BORROWING PRE-REQUESTS
// ==========================================
router.post('/request-book', authVerify, async (req, res) => {
  const { bookId } = req.body;
  const memberId = req.user.userId;

  try {
    const [[book]] = await db.query('SELECT Quantity, Title FROM books WHERE BookId = ?', [bookId]);
    if (!book || book.Quantity < 1) {
      return res.status(400).json({ message: 'This item is currently out of stock.' });
    }

    const [existing] = await db.query(
      'SELECT * FROM borrow WHERE MemberId = ? AND BookId = ? AND Status IN ("Requested", "Borrowed")',
      [memberId, bookId]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: 'You already have an active request or loan processing for this book.' });
    }

    await db.query(
      `INSERT INTO borrow (MemberId, BookId, BorrowDate, ReturnDate, Quantity, Status) 
       VALUES (?, ?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 7 DAY), 1, 'Requested')`,
      [memberId, bookId]
    );

    return res.status(201).json({ message: `Request for "${book.Title}" submitted successfully!` });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error processing book request.' });
  }
});

// ==========================================
// 7. APPROVE REQUESTS
// ==========================================
router.post('/approve-request/:id', authVerify, async (req, res) => {
  const borrowId = req.params.id;

  try {
    const [[requestData]] = await db.query('SELECT BookId, Status FROM borrow WHERE BorrowId = ?', [borrowId]);
    if (!requestData) {
      return res.status(404).json({ message: 'Request log reference not found.' });
    }
    if (requestData.Status !== 'Requested') {
      return res.status(400).json({ message: 'This request has already been processed.' });
    }

    const bookId = requestData.BookId;

    const [[book]] = await db.query('SELECT Quantity FROM books WHERE BookId = ?', [bookId]);
    if (!book || book.Quantity < 1) {
      return res.status(400).json({ message: 'Cannot approve. This item is out of stock.' });
    }

    await db.query(
      `UPDATE borrow 
       SET Status = 'Borrowed', BorrowDate = CURDATE(), ReturnDate = DATE_ADD(CURDATE(), INTERVAL 7 DAY) 
       WHERE BorrowId = ?`,
      [borrowId]
    );

    await db.query('UPDATE books SET Quantity = Quantity - 1 WHERE BookId = ?', [bookId]);

    return res.status(200).json({ message: 'Request approved successfully! Book is now issued out.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error processing approval.' });
  }
});

// ==========================================
// 8. REJECT REQUESTS
// ==========================================
router.post('/reject-request/:id', authVerify, async (req, res) => {
  const borrowId = req.params.id;
  try {
    await db.query('DELETE FROM borrow WHERE BorrowId = ? AND Status = "Requested"', [borrowId]);
    return res.status(200).json({ message: 'Borrow request rejected and removed cleanly.' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error rejecting request.' });
  }
});

module.exports = router;