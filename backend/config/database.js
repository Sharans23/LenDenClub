// config/database.js
const { Sequelize } = require("sequelize");

let sequelize;

// Try DATABASE_URL first (Render), fall back to individual vars (local)
if (process.env.DATABASE_URL) {
  // Render/Production
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    protocol: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    logging: false,
  });
} else {
  // Local Development
  require("dotenv").config();

  sequelize = new Sequelize(
    process.env.DB_NAME || "transaction_system",
    process.env.DB_USER || "postgres",
    process.env.DB_PASSWORD || "Sharan@1234",
    {
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 5432,
      dialect: "postgres",
      logging: false,
    }
  );
}

// Test connection
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection successful!");
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
  }
}

testConnection();

module.exports = sequelize;
