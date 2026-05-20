const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authVerify = require('../middleware/authVerify');

// FETCH ALL BORROW LOGS (Shows active vs returned items with clear relational details)
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

// INITIALIZE BORROW TRANSACTION (Safely handles stock checks and adjustments)
router.post('/borrow', authVerify, async (req, res) => {
  const { memberId, bookId, returnDate, quantity = 1 } = req.body;

  if (!memberId || !bookId || !returnDate) {
    return res.status(400).json({ message: 'Missing parameters: memberId, bookId, and returnDate are mandatory.' });
  }

  // Get a single dedicated connection client from the pool to run our atomic transaction
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Check if book inventory is sufficient
    const [books] = await connection.query('SELECT Quantity FROM books WHERE BookId = ? FOR UPDATE', [bookId]);
    if (books.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Target book record not found.' });
    }

    if (books[0].Quantity < quantity) {
      await connection.rollback();
      return res.status(400).json({ message: 'Insufficient inventory available to complete loan allocation.' });
    }

    // 2. Reduce the physical book quantity level count
    await connection.query('UPDATE books SET Quantity = Quantity - ? WHERE BookId = ?', [quantity, bookId]);

    // 3. Log into the borrow ledger matrix
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

// WORKFLOW PROCESSING FOR RETURN ENTRIES
router.post('/return', authVerify, async (req, res) => {
  const { borrowId, fine = 0, conditionStatus = 'Good' } = req.body;

  if (!borrowId) {
    return res.status(400).json({ message: 'BorrowId target trace reference is mandatory.' });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Extract borrow payload to confirm validation state status
    const [borrows] = await connection.query('SELECT * FROM borrow WHERE BorrowId = ? AND Status = "Borrowed" FOR UPDATE', [borrowId]);
    if (borrows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'No unresolved or matching borrow entries located for this reference ID.' });
    }

    const borrowRecord = borrows[0];

    // 2. Update status mapping indicator configuration properties
    await connection.query('UPDATE borrow SET Status = "Returned" WHERE BorrowId = ?', [borrowId]);

    // 3. Replenish catalog tracking numbers in the main table tracking matrix
    await connection.query('UPDATE books SET Quantity = Quantity + ? WHERE BookId = ?', [borrowRecord.Quantity, borrowRecord.BookId]);

    // 4. Log complete tracking entry directly into return records table files
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
// @route   GET /api/transactions/reports-summary
// @desc    Get system-wide analytics and report summaries
router.get('/reports-summary', async (req, res) => {
  try {
    // 1. Fetch total counts across operational units
    const [[{ totalBooks }]] = await db.query('SELECT SUM(Quantity) AS totalBooks FROM books');
    const [[{ totalMembers }]] = await db.query('SELECT COUNT(*) AS totalMembers FROM members');
    const [[{ activeLoans }]] = await db.query('SELECT COUNT(*) AS activeLoans FROM borrow WHERE Status = "Borrowed"');
    
    // 2. Calculate financial totals from returns tracking
    const [[{ totalFines }]] = await db.query('SELECT SUM(Fine) AS totalFines FROM returns');

    // 3. Get total books grouped by category for inventory distribution metrics
    const [categoryDistribution] = await db.query(`
      SELECT c.CategoryName, COUNT(b.BookId) AS BookCount, IFNULL(SUM(b.Quantity), 0) AS TotalStock
      FROM categories c
      LEFT JOIN books b ON c.CategoryId = b.CategoryId
      GROUP BY c.CategoryId
    `);

    // 4. Fetch books that are currently overdue (Due date passed and still marked 'Borrowed')
    const [overdueItems] = await db.query(`
      SELECT b.BorrowId, m.FullName AS MemberName, bk.Title AS BookTitle, b.ReturnDate
      FROM borrow b
      JOIN members m ON b.MemberId = m.MemberId
      JOIN books bk ON b.BookId = bk.BookId
      WHERE b.Status = 'Borrowed' AND b.ReturnDate < CURDATE()
    `);

    res.status(200).json({
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
    res.status(500).json({ message: 'Internal server error compiling analytics data.' });
  }
});

module.exports = router;