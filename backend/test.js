const sequelize = require("./config/database");

async function testDatabase() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection is working!");

    // Sync models with database
    await sequelize.sync();
    console.log("✅ Database models synced!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

testDatabase();
