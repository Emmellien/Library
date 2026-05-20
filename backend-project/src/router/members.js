const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authVerify = require('../middleware/authVerify');

// FETCH ALL MEMBERS (With Paginated Results & Full-Text Search)
router.get('/', authVerify, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const offset = (page - 1) * limit;

    let sqlQuery = `SELECT * FROM members WHERE 1=1`;
    let queryParams = [];

    if (search) {
      sqlQuery += ` AND (FullName LIKE ? OR Phone LIKE ? OR Email LIKE ?)`;
      const wildcard = `%${search}%`;
      queryParams.push(wildcard, wildcard, wildcard);
    }

    const [totalRows] = await db.query(sqlQuery, queryParams);
    const totalRecords = totalRows.length;

    sqlQuery += ` ORDER BY MemberId DESC LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);

    const [members] = await db.query(sqlQuery, queryParams);

    return res.status(200).json({
      data: members,
      pagination: {
        totalRecords,
        currentPage: page,
        totalPages: Math.ceil(totalRecords / limit),
        perPage: limit
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error retrieving member records.' });
  }
});

// CREATE NEW MEMBER
router.post('/', authVerify, async (req, res) => {
  const { fullName, gender, phone, email, address } = req.body;

  if (!fullName) {
    return res.status(400).json({ message: 'Member FullName field is required.' });
  }

  try {
    const sqlInsert = `
      INSERT INTO members (FullName, Gender, Phone, Email, Address, RegisteredDate)
      VALUES (?, ?, ?, ?, ?, CURDATE())
    `;
    const [result] = await db.query(sqlInsert, [fullName, gender, phone, email, address]);
    return res.status(201).json({ message: 'Member registration successful.', memberId: result.insertId });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to record member dataset.' });
  }
});

// DELETE MEMBER LOG ENTRIES
router.delete('/:id', authVerify, async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM members WHERE MemberId = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Target member entry not found.' });
    }
    return res.status(200).json({ message: 'Member account profile successfully removed.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal transactional rollback error experienced.' });
  }
});

module.exports = router;    