// Load environment variables
require("dotenv").config();

// Import Sequelize
const { Sequelize } = require("sequelize");

// Create connection to PostgreSQL
const sequelize = new Sequelize(
  process.env.DB_NAME, // database name
  process.env.DB_USER, // username
  process.env.DB_PASSWORD, // password
  {
    host: process.env.DB_HOST, // localhost
    port: process.env.DB_PORT, // 5432
    dialect: "postgres", // database type
    logging: false, // don't show SQL logs in console
  }
);

// Test connection
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log("Database connection successful!");
  } catch (error) {
    console.error("Database connection failed:", error);
  }
}

// Run connection test
testConnection();

// Export the connection
module.exports = sequelize;
