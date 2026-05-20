const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    // 1. First, check if the email belongs to a Staff/Admin in the users table
    let [rows] = await db.query('SELECT * FROM users WHERE Email = ?', [email]);
    let isStaff = true;

    // 2. If not found in users, check if it belongs to a Student/Member in the members table
    if (rows.length === 0) {
      [rows] = await db.query('SELECT * FROM members WHERE Email = ?', [email]);
      isStaff = false;
    }
    
    // If it's not in either table, reject the login
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const account = rows[0];

    // 3. Verify the password hash
    const isMatch = await bcrypt.compare(password, account.Password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // 4. Generate the token with their correct ID and Role
    // We use account.MemberId if they are a member, otherwise account.UserId
    const targetId = isStaff ? account.UserId : account.MemberId;
    const targetRole = isStaff ? account.Role : 'member';

    const token = jwt.sign(
      { userId: targetId, role: targetRole },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: targetId,
        fullName: account.FullName,
        email: account.Email,
        role: targetRole
      }
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

router.post('/register', async (req, res) => {
  const { fullName, email, Phone, password, role, gender, phone, address } = req.body;

  // Basic validation
  if (!fullName || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required.' });
  }

  try {
    // 1. Check if the user already exists in either table
    const [checkUser] = await db.query('SELECT Email FROM users WHERE Email = ?', [email]);
    const [checkMember] = await db.query('SELECT Email FROM members WHERE Email = ?', [email]);

    if (checkUser.length > 0 || checkMember.length > 0) {
      return res.status(400).json({ message: 'This email is already registered.' });
    }

    // 2. Encrypt the password string
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const targetRole = role ? role.toLowerCase() : 'member';

    // 3. Insert into the correct table based on role target
    if (targetRole === 'member' || targetRole === 'student') {
      // Save directly to the members table
      await db.query(
        `INSERT INTO members (FullName, Gender, Phone, Email, Address, RegisteredDate, Password, Role) 
         VALUES (?, ?, ?, ?, ?, CURDATE(), ?, 'member')`,
        [fullName, gender || null, phone || null, email, address || null, hashedPassword]
      );
    } else {
      // Save to the internal staff users table (admin / librarian)
      await db.query(
        'INSERT INTO users (FullName, Email, phone, Password, Role) VALUES (?, ?, ?, ?)',
        [fullName, email, hashedPassword, targetRole]
      );
    }

    return res.status(201).json({ 
      message: `${targetRole.toUpperCase()} registered successfully into the database layout.` 
    });

  } catch (error) {
    console.error('Registration processing error:', error);
    return res.status(500).json({ message: 'Internal server registration processing error.' });
  }
});

module.exports = router;