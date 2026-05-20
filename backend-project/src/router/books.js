const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authVerify = require('../middleware/authVerify');

// FETCH ALL BOOKS (With Built-in Search, Category Filters, and Table Pagination)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const categoryId = req.query.categoryId || '';
    
    const offset = (page - 1) * limit;
    let queryParams = [];
    
    // Core selection query statement joining foreign properties safely
    let sqlQuery = `
      SELECT b.*, c.CategoryName, a.AuthorName 
      FROM books b
      LEFT JOIN categories c ON b.CategoryId = c.CategoryId
      LEFT JOIN authors a ON b.AuthorId = a.AuthorId
      WHERE 1=1
    `;

    if (search) {
      sqlQuery += ` AND (b.Title LIKE ? OR b.ISBN LIKE ? OR a.AuthorName LIKE ?)`;
      const searchWildcard = `%${search}%`;
      queryParams.push(searchWildcard, searchWildcard, searchWildcard);
    }

    if (categoryId) {
      sqlQuery += ` AND b.CategoryId = ?`;
      queryParams.push(categoryId);
    }

    // Capture total trace before enforcing slice limits
    const [totalRows] = await db.query(sqlQuery, queryParams);
    const totalRecords = totalRows.length;

    sqlQuery += ` ORDER BY b.BookId DESC LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);

    const [books] = await db.query(sqlQuery, queryParams);

    return res.status(200).json({
      data: books,
      pagination: {
        totalRecords,
        currentPage: page,
        totalPages: Math.ceil(totalRecords / limit),
        perPage: limit
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error retrieving book collection records.' });
  }
});

// CREATE A NEW BOOK RECORD (Protected Route)
router.post('/', authVerify, async (req, res) => {
  const { title, isbn, categoryId, authorId, publishedYear, price, quantity, shelf, description, bookImage } = req.body;

  if (!title) {
    return res.status(400).json({ message: 'Book title configuration is mandatory.' });
  }

  try {
    const sqlInsert = `
      INSERT INTO books (Title, ISBN, CategoryId, AuthorId, PublishedYear, Price, Quantity, Shelf, Description, BookImage)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(sqlInsert, [title, isbn, categoryId, authorId, publishedYear, price, quantity || 0, shelf, description, bookImage]);
    
    return res.status(201).json({ message: 'Book inventory record established successfully.', bookId: result.insertId });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to record catalog entry data.' });
  }
});

// DELETE BOOK ENTRIES BY UNIQUE REFERENCE IDENTIFIER (Protected Route)
router.delete('/:id', authVerify, async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM books WHERE BookId = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Target book reference entity record not identified.' });
    }
    return res.status(200).json({ message: 'Book data scrubbed from active catalog database logs.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal transactional rollback error experienced.' });
  }
});
// Get all authors for dropdowns
router.get('/authors', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM authors ORDER BY AuthorName ASC');
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all categories for dropdowns
router.get('/categories', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM categories ORDER BY CategoryName ASC');
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/categories', async (req, res) => {
  const { categoryName, description } = req.body;

  if (!categoryName) {
    return res.status(400).json({ message: 'Category Name is required.' });
  }

  try {
    // Check if category name already exists
    const [existing] = await db.query('SELECT * FROM categories WHERE CategoryName = ?', [categoryName]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'This category name already exists.' });
    }

    const [result] = await db.query(
      'INSERT INTO categories (CategoryName, Description) VALUES (?, ?)',
      [categoryName, description]
    );

    return res.status(201).json({
      message: 'Category created successfully.',
      data: { categoryId: result.insertId, categoryName, description }
    });
  } catch (err) {
    console.error('Error creating category:', err);
    return res.status(500).json({ message: 'Internal server error saving category.' });
  }
});

module.exports = router;