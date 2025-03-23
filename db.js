// Import mysql2/promise
const mysql = require('mysql2/promise');  // Import mysql2 for promises

// Create a function to handle the database connection asynchronously
async function connectToDatabase() {
  // Create a connection to the database
  const connection = await mysql.createConnection({
    host: 'localhost',  // Database server
    user: 'root',       // Database username
    password: '',       // Database password
    database: 'node'    // Name of the database
  });

  try {
    // Wait for the connection to be established
    console.log('Connected to MySQL!');
    return connection;  // Return the connection object
  } catch (err) {
    console.error('Error connecting to MySQL:', err.stack);
    throw err;  // Throw the error if connection fails
  }
}

module.exports = connectToDatabase;  // Export the connection function
