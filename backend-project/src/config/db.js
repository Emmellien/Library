const mysql = require('mysql2/promise');
require('dotenv').config();

const conn = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
//test connection using async/await
async function testConnection() {
    try {
        const connection = await conn.getConnection();
        console.log('Database ' + process.env.DB_NAME + ' connection successful!');
        connection.release();
    } catch (error) {
        console.error('Error connecting to the database:', error);
    }
}
testConnection();

 
module.exports = conn;
