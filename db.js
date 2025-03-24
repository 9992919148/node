const mysql = require('mysql2');

// Create a connection pool (useful for handling multiple requests)
const pool = mysql.createPool({
  host: '172.16.17.68',
  user: 'sdx_ind_uat_dbadmin',
  password: 'ZYP82k964whg',
  database: 'pms_uat',
  waitForConnections: true,
  connectionLimit: 10,  // Max connections in the pool
  queueLimit: 0
});

// Export the pool
module.exports = pool;

// // Import mysql2/promise
// const mysql = require('mysql2/promise');  // Import mysql2 for promises

// // Create a function to handle the database connection asynchronously
// async function connectToDatabase() {
//   // Create a connection to the database
//   const connection = await mysql.createConnection({
//     host: 'localhost',  // Database server
//     user: 'root',       // Database username
//     password: '',       // Database password
//     database: 'node'    // Name of the database
//   });

//   try {
//     // Wait for the connection to be established
//     console.log('Connected to MySQL!');
//     return connection;  // Return the connection object
//   } catch (err) {
//     console.error('Error connecting to MySQL:', err.stack);
//     throw err;  // Throw the error if connection fails
//   }
// }

// module.exports = connectToDatabase;  // Export the connection function
