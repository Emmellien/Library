const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Basic payload verification
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    // Check if user exists in the database
    const [rows] = await db.query('SELECT * FROM users WHERE Email = ?', [email]);
    
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const user = rows[0];

    // Check password compatibility (handles your plain text sample data or bcrypt hashes)
    let isMatch = false;
    if (user.Password.startsWith('$2a$') || user.Password.startsWith('$2b$')) {
      isMatch = await bcrypt.compare(password, user.Password);
    } else {
      isMatch = (password === user.Password);
    }

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Generate JWT token containing key user parameters
    const token = jwt.sign(
      { userId: user.UserId, role: user.Role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    // Respond with clean user context payload
    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.UserId,
        fullName: user.FullName,
        email: user.Email,
        role: user.Role
      }
    });

  } catch (error) {
    console.error('Error during login execution:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

// @route   POST /api/auth/register
// @desc    Register a new system user / administrator
router.post('/register', async (req, res) => {
  const { fullName, email, password, role } = req.body;

  // 1. Basic payload verification
  if (!fullName || !email || !password) {
    return res.status(400).json({ 
      message: 'Full name, email address, and password fields are strictly required.' 
    });
  }

  // Fallback to 'Staff' role if none provided
  const userRole = role || 'Staff'; 

  try {
    // 2. Check if the email address is already registered in the system
    const [existingUsers] = await db.query(
      'SELECT UserId FROM users WHERE Email = ?', 
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ 
        message: 'A user account with this email address already exists.' 
      });
    }

    // 3. Hash the plain text password securely using bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Insert the new account record into the database
    const insertQuery = `
      INSERT INTO users (FullName, Email, Password, Role) 
      VALUES (?, ?, ?, ?)
    `;
    
    const [result] = await db.query(insertQuery, [
      fullName, 
      email, 
      hashedPassword, 
      userRole
    ]);

    // 5. Respond with a success payload
    return res.status(201).json({
      message: 'User account registered successfully.',
      user: {
        id: result.insertId,
        fullName,
        email,
        role: userRole
      }
    });

  } catch (error) {
    console.error('Error during registration execution:', error);
    return res.status(500).json({ 
      message: 'Internal server error during account registration.' 
    });
  }
});

module.exports = router;