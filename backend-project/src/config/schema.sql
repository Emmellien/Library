-- =========================================================
-- SYSTEM ENGINE INITIALIZATION
-- =========================================================
CREATE DATABASE IF NOT EXISTS library_db;
USE library_db;

DROP TABLE IF EXISTS returns;
DROP TABLE IF EXISTS borrow;
DROP TABLE IF EXISTS members;
DROP TABLE IF EXISTS books;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS authors;
DROP TABLE IF EXISTS users;

-- =========================================================
-- PRIMARY SYSTEM RELATION MAPS
-- =========================================================

CREATE TABLE users (
    UserId INT AUTO_INCREMENT PRIMARY KEY,
    FullName VARCHAR(100) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    Password VARCHAR(255) NOT NULL,
    Role VARCHAR(50) DEFAULT 'admin',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE authors (
    AuthorId INT AUTO_INCREMENT PRIMARY KEY,
    AuthorName VARCHAR(100) NOT NULL,
    Country VARCHAR(100),
    BirthDate DATE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
    CategoryId INT AUTO_INCREMENT PRIMARY KEY,
    CategoryName VARCHAR(100) NOT NULL UNIQUE,
    Description TEXT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE books (
    BookId INT AUTO_INCREMENT PRIMARY KEY,
    Title VARCHAR(200) NOT NULL,
    ISBN VARCHAR(50) UNIQUE,
    CategoryId INT,
    AuthorId INT,
    PublishedYear YEAR,
    Price DECIMAL(10,2),
    Quantity INT DEFAULT 0,
    Shelf VARCHAR(50),
    Description TEXT,
    BookImage VARCHAR(255),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (CategoryId) REFERENCES categories(CategoryId) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (AuthorId) REFERENCES authors(AuthorId) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE members (
    MemberId INT AUTO_INCREMENT PRIMARY KEY,
    FullName VARCHAR(100) NOT NULL,
    Gender VARCHAR(20),
    Phone VARCHAR(20),
    Email VARCHAR(100),
    Address TEXT,
    RegisteredDate DATE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE borrow (
    BorrowId INT AUTO_INCREMENT PRIMARY KEY,
    MemberId INT,
    BookId INT,
    BorrowDate DATE NOT NULL,
    ReturnDate DATE,
    Quantity INT DEFAULT 1,
    Status VARCHAR(50) DEFAULT 'Borrowed',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (MemberId) REFERENCES members(MemberId) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (BookId) REFERENCES books(BookId) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE returns (
    ReturnId INT AUTO_INCREMENT PRIMARY KEY,
    BorrowId INT,
    ReturnedDate DATE,
    Fine DECIMAL(10,2) DEFAULT 0,
    ConditionStatus VARCHAR(100),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (BorrowId) REFERENCES borrow(BorrowId) ON DELETE CASCADE ON UPDATE CASCADE
);

-- =========================================================
-- INITIAL SEED CORE DATA
-- =========================================================

INSERT INTO users (FullName, Email, Password, Role) VALUES
('Admin User', 'admin@gmail.com', '$2b$10$wK1WwzXo0D8bVp/Xw8E8u.OqXj3O2hVf/pXzH6S.8M5UuLqP8eU26', 'admin'); -- Default encrypted hash for '123456'

INSERT INTO authors (AuthorName, Country, BirthDate) VALUES
('Chinua Achebe', 'Nigeria', '1930-11-16'),
('J.K. Rowling', 'United Kingdom', '1965-07-31'),
('George Orwell', 'India', '1903-06-25');

INSERT INTO categories (CategoryName, Description) VALUES
('Novel', 'Story books and novels'),
('Science', 'Science and research books'),
('Technology', 'Computer and IT books'),
('History', 'Historical books');

INSERT INTO books (Title, ISBN, CategoryId, AuthorId, PublishedYear, Price, Quantity, Shelf, Description) VALUES
('Things Fall Apart', '9780435905255', 1, 1, 1958, 15.00, 10, 'A1', 'African classic novel'),
('Harry Potter', '9780747532743', 1, 2, 1997, 25.00, 15, 'B1', 'Fantasy novel'),
('1984', '9780451524935', 4, 3, 1949, 18.00, 8, 'C1', 'Political fiction novel');

INSERT INTO members (FullName, Gender, Phone, Email, Address, RegisteredDate) VALUES
('John Doe', 'Male', '0788000001', 'john@gmail.com', 'Kigali', CURDATE()),
('Jane Smith', 'Female', '0788000002', 'jane@gmail.com', 'Huye', CURDATE());

INSERT INTO borrow (MemberId, BookId, BorrowDate, ReturnDate, Quantity, Status) VALUES
(1, 1, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 7 DAY), 1, 'Borrowed');