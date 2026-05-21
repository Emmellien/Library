# Library Management System

A full-stack Library Management System built using:

- React + Vite (Frontend)
- Express.js + Node.js (Backend)
- MySQL Database

---

# Features

- User Login Authentication
- Dashboard
- Manage Books
- Manage Authors
- Manage Categories
- Manage Members
- Borrow Books
- Return Books
- Reports System
- MySQL Database Integration

---

# Project Structure

```bash
LIBRARY/
│
├── backend-project/
│
└── frontend-project/


---

# `backend-project/README.md`

```md id="m88m8o"
# Backend - Library Management System

Backend API built with:

- Node.js
- Express.js
- MySQL

---

# Folder Structure

```bash
backend-project/
│
├── node_modules/
├── src/
│   ├── config/
│   │   └── db.js
│   │
│   ├── router/
│   │   └── auth.js
│   │
│   └── server.js
│
├── .env
├── package.json
└── README.md

# System Users

A Library Management System can have different types of users depending on how you want the system to work.

---

# Main Users of the System

## 1. Admin

Main controller of the system.

### Admin Can:
- Login
- Manage books
- Manage authors
- Manage categories
- Manage members
- Borrow and return books
- View reports
- Add other users
- Delete records

---

## 2. Librarian

Person who works in the library.

### Librarian Can:
- Login
- Add books
- Update books
- Borrow books
- Return books
- Register members
- View reports

### Librarian Cannot:
- Delete admin accounts
- Manage system settings

---

## 3. Member / Student

Person who borrows books.

### Member Can:
- Login / defoult password for member is :123456 with Email Address
- Search books
- View borrowed books
- View return dates
- View fines

### Member Cannot:
- Add books
- Delete books
- Manage users# Library
