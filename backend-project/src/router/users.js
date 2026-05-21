const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authVerify = require('../middleware/authVerify');

// @route   GET /api/users/staff-public
// @desc    Retrieve system administrators and librarians for public directories
router.get('/staff-public', async (req, res) => {
  try {
    // Selects only non-sensitive identifying parameters out of users dataset matrix
    const sqlQuery = `
      SELECT UserId, FullName, Email,Phone ,Role 
      FROM users 
      WHERE Role IN ('Admin', 'Librarian')
      ORDER BY Role ASC, FullName ASC
    `;
    
    const [staffDirectory] = await db.query(sqlQuery);
    
    return res.status(200).json({ 
      success: true,
      data: staffDirectory 
    });
  } catch (error) {
    console.error('Database connection error mapping public staff data:', error);
    return res.status(500).json({ message: 'Failed to access structural directory matrix profiles.' });
  }
});

module.exports = router;