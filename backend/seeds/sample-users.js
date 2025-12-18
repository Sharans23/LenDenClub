const bcrypt = require("bcryptjs");
const { User } = require("../models");

async function createSampleUsers() {
  try {
    console.log("Creating sample users...");

    // Clear existing sample users
    await User.destroy({
      where: {
        username: ["alice", "bob", "charlie"],
      },
    });

    // Create sample users
    const sampleUsers = [
      {
        username: "alice",
        password: await bcrypt.hash("alice123", 10),
        balance: 5000.0,
      },
      {
        username: "bob",
        password: await bcrypt.hash("bob123", 10),
        balance: 3000.0,
      },
      {
        username: "charlie",
        password: await bcrypt.hash("charlie123", 10),
        balance: 2000.0,
      },
    ];

    await User.bulkCreate(sampleUsers);

    console.log("✅ Sample users created successfully!");
    console.log("\n📋 Login credentials:");
    console.log("   Username: alice, Password: alice123, Balance: 5000");
    console.log("   Username: bob, Password: bob123, Balance: 3000");
    console.log("   Username: charlie, Password: charlie123, Balance: 2000");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating sample users:", error);
    process.exit(1);
  }
}

createSampleUsers();
