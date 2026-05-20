const express = require('express');
const cors = require('cors');
const db = require('./config/db');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

//router configuration
const authRouter = require('./router/auth');
const booksRouter = require('./router/books');
const membersRouter = require('./router/members');
const transactionsRouter = require('./router/transactions');
const usersRouter = require('./router/users');

//routes configuration 
app.use('/api/auth', authRouter);
app.use('/api/books', booksRouter);
app.use('/api/members', membersRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/users', usersRouter);

//catch-all route for undefined endpoints
app.use((req, res) => {
  res.status(404).json({ message: 'Resource API endpoint not found.' });
});

app.listen(port, () => {    
    console.log(`Server is running on http://localhost:${port}`);
});