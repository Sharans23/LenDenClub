const { Client } = require("pg");
require("dotenv").config();

const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function test() {
  console.log("Testing PostgreSQL connection...");
  console.log("User:", process.env.DB_USER);
  console.log("Database:", process.env.DB_NAME);
  console.log("Host:", process.env.DB_HOST);

  try {
    await client.connect();
    console.log("✅ Connected to PostgreSQL!");

    // Check if database exists
    const result = await client.query(
      "SELECT current_database(), current_user"
    );
    console.log("Current database:", result.rows[0].current_database);
    console.log("Current user:", result.rows[0].current_user);

    await client.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Connection failed:", error.message);

    // Try to connect without database first
    console.log("\nTrying to connect to default postgres database...");
    const client2 = new Client({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: "postgres", // Default database
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
    });

    try {
      await client2.connect();
      console.log("✅ Connected to default postgres database");

      // Create our database
      await client2.query("CREATE DATABASE transaction_system");
      console.log("✅ Created transaction_system database");

      await client2.end();
      process.exit(0);
    } catch (error2) {
      console.error(
        "❌ Failed to connect to default database:",
        error2.message
      );
      console.log("\n💡 Possible solutions:");
      console.log("1. Check if PostgreSQL service is running");
      console.log("2. Check your password in .env file");
      console.log("3. Try using SQLite instead (easier)");
      process.exit(1);
    }
  }
}

test();
