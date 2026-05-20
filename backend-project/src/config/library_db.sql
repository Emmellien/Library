-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 20, 2026 at 09:41 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `library_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `authors`
--

CREATE TABLE `authors` (
  `AuthorId` int(11) NOT NULL,
  `AuthorName` varchar(100) NOT NULL,
  `Country` varchar(100) DEFAULT NULL,
  `BirthDate` date DEFAULT NULL,
  `CreatedAt` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `authors`
--

INSERT INTO `authors` (`AuthorId`, `AuthorName`, `Country`, `BirthDate`, `CreatedAt`) VALUES
(1, 'Chinua Achebe', 'Nigeria', '1930-11-16', '2026-05-20 14:50:32'),
(2, 'J.K. Rowling', 'United Kingdom', '1965-07-31', '2026-05-20 14:50:32'),
(3, 'George Orwell', 'India', '1903-06-25', '2026-05-20 14:50:32');

-- --------------------------------------------------------

--
-- Table structure for table `books`
--

CREATE TABLE `books` (
  `BookId` int(11) NOT NULL,
  `Title` varchar(200) NOT NULL,
  `ISBN` varchar(50) DEFAULT NULL,
  `CategoryId` int(11) DEFAULT NULL,
  `AuthorId` int(11) DEFAULT NULL,
  `PublishedYear` year(4) DEFAULT NULL,
  `Price` decimal(10,2) DEFAULT NULL,
  `Quantity` int(11) DEFAULT 0,
  `Shelf` varchar(50) DEFAULT NULL,
  `Description` text DEFAULT NULL,
  `BookImage` varchar(255) DEFAULT NULL,
  `CreatedAt` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `books`
--

INSERT INTO `books` (`BookId`, `Title`, `ISBN`, `CategoryId`, `AuthorId`, `PublishedYear`, `Price`, `Quantity`, `Shelf`, `Description`, `BookImage`, `CreatedAt`) VALUES
(1, 'Things Fall Apart', '9780435905255', 1, 1, '1958', 15.00, 10, 'A1', 'African classic novel', NULL, '2026-05-20 14:50:32'),
(2, 'Harry Potter', '9780747532743', 1, 2, '1997', 25.00, 15, 'B1', 'Fantasy novel', NULL, '2026-05-20 14:50:32'),
(3, '1984', '9780451524935', 4, 3, '1949', 18.00, 7, 'C1', 'Political fiction novel', NULL, '2026-05-20 14:50:32'),
(4, 'ICT', '1234567', 3, 1, '2026', 10000.00, 5, 'A!', NULL, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRP06oO6amQb20d0tRNlwNIsF8qcd8ri-8iVg&s', '2026-05-20 16:25:45'),
(6, 'LOVE @', '12345', 5, 1, '2026', 2000.00, 3, 'A5', 'test', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRP06oO6amQb20d0tRNlwNIsF8qcd8ri-8iVg&s', '2026-05-20 18:25:59'),
(7, 'h888', '567', 2, 3, '2026', 554545.00, 4, 'A#', 'e22e2e2e2eee', NULL, '2026-05-20 19:08:06');

-- --------------------------------------------------------

--
-- Table structure for table `borrow`
--

CREATE TABLE `borrow` (
  `BorrowId` int(11) NOT NULL,
  `MemberId` int(11) DEFAULT NULL,
  `BookId` int(11) DEFAULT NULL,
  `BorrowDate` date NOT NULL,
  `ReturnDate` date DEFAULT NULL,
  `Quantity` int(11) DEFAULT 1,
  `Status` varchar(50) DEFAULT 'Borrowed',
  `CreatedAt` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `borrow`
--

INSERT INTO `borrow` (`BorrowId`, `MemberId`, `BookId`, `BorrowDate`, `ReturnDate`, `Quantity`, `Status`, `CreatedAt`) VALUES
(1, 1, 1, '2026-05-20', '2026-05-27', 1, 'Borrowed', '2026-05-20 14:50:32'),
(2, 2, 4, '2026-05-20', '2026-05-27', 1, 'Returned', '2026-05-20 16:26:49'),
(5, 4, 3, '2026-05-20', '2026-05-27', 1, 'Borrowed', '2026-05-20 18:31:23'),
(11, 5, 7, '2026-05-20', '2026-05-27', 1, 'Borrowed', '2026-05-20 19:34:36');

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `CategoryId` int(11) NOT NULL,
  `CategoryName` varchar(100) NOT NULL,
  `Description` text DEFAULT NULL,
  `CreatedAt` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`CategoryId`, `CategoryName`, `Description`, `CreatedAt`) VALUES
(1, 'Novel', 'Story books and novels', '2026-05-20 14:50:32'),
(2, 'Science', 'Science and research books', '2026-05-20 14:50:32'),
(3, 'Technology', 'Computer and IT books', '2026-05-20 14:50:32'),
(4, 'History', 'Historical books', '2026-05-20 14:50:32'),
(5, 'Love ', 'Love story books', '2026-05-20 16:44:28'),
(6, 'hh', 'hhhhh', '2026-05-20 19:08:18');

-- --------------------------------------------------------

--
-- Table structure for table `members`
--

CREATE TABLE `members` (
  `MemberId` int(11) NOT NULL,
  `FullName` varchar(100) NOT NULL,
  `Gender` varchar(20) DEFAULT NULL,
  `Phone` varchar(20) DEFAULT NULL,
  `Email` varchar(100) DEFAULT NULL,
  `Address` text DEFAULT NULL,
  `RegisteredDate` date DEFAULT NULL,
  `CreatedAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `Password` varchar(255) NOT NULL DEFAULT '$2b$10$wK1WwzXo0D8bVp/Xw8E8u.OqXj3O2hVf/pXzH6S.8M5UuLqP8eU26',
  `Role` varchar(50) DEFAULT 'member'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `members`
--

INSERT INTO `members` (`MemberId`, `FullName`, `Gender`, `Phone`, `Email`, `Address`, `RegisteredDate`, `CreatedAt`, `Password`, `Role`) VALUES
(1, 'John Doe', 'Male', '0788000001', 'john@gmail.com', 'Kigali', '2026-05-20', '2026-05-20 14:50:32', '$2b$10$wK1WwzXo0D8bVp/Xw8E8u.OqXj3O2hVf/pXzH6S.8M5UuLqP8eU26', 'member'),
(2, 'Jane Smith', 'Female', '0788000002', 'jane@gmail.com', 'Huye', '2026-05-20', '2026-05-20 14:50:32', '$2b$10$wK1WwzXo0D8bVp/Xw8E8u.OqXj3O2hVf/pXzH6S.8M5UuLqP8eU26', 'member'),
(3, 'Emmellien', 'Male', '0781013100', 'emmellieng@gmail.com', 'Nyamagabe, Gasaka', '2026-05-20', '2026-05-20 16:46:01', '$2b$10$wK1WwzXo0D8bVp/Xw8E8u.OqXj3O2hVf/pXzH6S.8M5UuLqP8eU26', 'member'),
(4, 'ineza', 'Female', '0781013100', 'ineza@gmail.com', 'Huye', '2026-05-20', '2026-05-20 17:38:14', '$2b$10$bSTbeLOXoLQEr9hJN8KQi.6kWM67gX8EFalFVPFNT/YaHdavL1TVK', 'member'),
(5, 'kamana', NULL, '(+250) 789 101 300', 'kamana@gmail.com', NULL, '2026-05-20', '2026-05-20 19:34:22', '$2b$10$P7RHjqI/NfpWhFT3HMBcX.Sodd3d8IiOq741WVjcf5Wm2i3lhRXSe', 'member');

-- --------------------------------------------------------

--
-- Table structure for table `returns`
--

CREATE TABLE `returns` (
  `ReturnId` int(11) NOT NULL,
  `BorrowId` int(11) DEFAULT NULL,
  `ReturnedDate` date DEFAULT NULL,
  `Fine` decimal(10,2) DEFAULT 0.00,
  `ConditionStatus` varchar(100) DEFAULT NULL,
  `CreatedAt` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `returns`
--

INSERT INTO `returns` (`ReturnId`, `BorrowId`, `ReturnedDate`, `Fine`, `ConditionStatus`, `CreatedAt`) VALUES
(1, 2, '2026-05-20', 0.00, 'Good', '2026-05-20 16:37:33');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `UserId` int(11) NOT NULL,
  `FullName` varchar(100) NOT NULL,
  `Email` varchar(100) NOT NULL,
  `Phone` varchar(20) DEFAULT NULL,
  `Password` varchar(255) NOT NULL,
  `Role` varchar(50) DEFAULT 'admin',
  `CreatedAt` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`UserId`, `FullName`, `Email`, `Phone`, `Password`, `Role`, `CreatedAt`) VALUES
(1, 'Admin User', 'admin@gmail.com', NULL, '$2b$10$wK1WwzXo0D8bVp/Xw8E8u.OqXj3O2hVf/pXzH6S.8M5UuLqP8eU26', 'admin', '2026-05-20 14:50:32'),
(2, 'Amani', 'amani@gmail.com', NULL, '$2b$10$voBHjvFHQGl8CbpWSnuaZeFxqx1lW00jK4V6xTJXWCMdCdC96UU.q', 'admin', '2026-05-20 15:34:40'),
(3, 'Emmellien', 'emmellien@gmail.com', NULL, '$2b$10$YwKIf2wEWzWjsXc1lYEfWOf2y4WcER1OvSKK.wv9DV4ev1P0NROfG', 'librarian', '2026-05-20 17:22:09');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `authors`
--
ALTER TABLE `authors`
  ADD PRIMARY KEY (`AuthorId`);

--
-- Indexes for table `books`
--
ALTER TABLE `books`
  ADD PRIMARY KEY (`BookId`),
  ADD UNIQUE KEY `ISBN` (`ISBN`),
  ADD KEY `CategoryId` (`CategoryId`),
  ADD KEY `AuthorId` (`AuthorId`);

--
-- Indexes for table `borrow`
--
ALTER TABLE `borrow`
  ADD PRIMARY KEY (`BorrowId`),
  ADD KEY `MemberId` (`MemberId`),
  ADD KEY `BookId` (`BookId`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`CategoryId`),
  ADD UNIQUE KEY `CategoryName` (`CategoryName`);

--
-- Indexes for table `members`
--
ALTER TABLE `members`
  ADD PRIMARY KEY (`MemberId`);

--
-- Indexes for table `returns`
--
ALTER TABLE `returns`
  ADD PRIMARY KEY (`ReturnId`),
  ADD KEY `BorrowId` (`BorrowId`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`UserId`),
  ADD UNIQUE KEY `Email` (`Email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `authors`
--
ALTER TABLE `authors`
  MODIFY `AuthorId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `books`
--
ALTER TABLE `books`
  MODIFY `BookId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `borrow`
--
ALTER TABLE `borrow`
  MODIFY `BorrowId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `CategoryId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `members`
--
ALTER TABLE `members`
  MODIFY `MemberId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `returns`
--
ALTER TABLE `returns`
  MODIFY `ReturnId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `UserId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `books`
--
ALTER TABLE `books`
  ADD CONSTRAINT `books_ibfk_1` FOREIGN KEY (`CategoryId`) REFERENCES `categories` (`CategoryId`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `books_ibfk_2` FOREIGN KEY (`AuthorId`) REFERENCES `authors` (`AuthorId`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `borrow`
--
ALTER TABLE `borrow`
  ADD CONSTRAINT `borrow_ibfk_1` FOREIGN KEY (`MemberId`) REFERENCES `members` (`MemberId`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `borrow_ibfk_2` FOREIGN KEY (`BookId`) REFERENCES `books` (`BookId`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `returns`
--
ALTER TABLE `returns`
  ADD CONSTRAINT `returns_ibfk_1` FOREIGN KEY (`BorrowId`) REFERENCES `borrow` (`BorrowId`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
