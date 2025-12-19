// Load environment variables
require("dotenv").config();

// Import required packages
const express = require("express");
const cors = require("cors");
const sequelize = require("./config/database"); // Add this line

// Create Express app
const app = express();

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173", // Local frontend
      "https://len-den-club.vercel.app", // Will update after deployment
      "http://localhost:3000",
    ],
    credentials: true,
  })
);
app.use(express.json());

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "Transaction System API is running!",
    status: "OK",
    timestamp: new Date().toISOString(),
  });
});

// Simple health check
app.get("/health", (req, res) => {
  res.json({ status: "healthy" });
});

// Import routes
const authRoutes = require("./routes/auth");
const transactionRoutes = require("./routes/transaction");
const userRoutes = require("./routes/user");

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/transaction", transactionRoutes);
app.use("/api/user", userRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err.stack);
  res.status(500).json({
    error: "Something went wrong!",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Start server
const PORT = process.env.PORT || 5001;

// Initialize database and start server
async function startServer() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");

    // Sync models with database (ALTER will add missing columns)
    await sequelize.sync();
    console.log("✅ Database models synced");

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📌 Available endpoints:`);
      console.log(`   GET  /`);
      console.log(`   GET  /health`);
      console.log(`   POST /api/auth/register     - Register new user`);
      console.log(`   POST /api/auth/login        - Login user`);
      console.log(`   POST /api/transaction/transfer   - Transfer money`);
      console.log(
        `   GET  /api/transaction/transactions - Transaction history`
      );
      console.log(`   GET  /api/transaction/balance     - Get balance`);
      console.log(`   GET  /api/user/profile          - Get user profile`);
      console.log(`   PUT  /api/user/profile          - Update profile`);
      console.log(`   PUT  /api/user/change-password  - Change password`);
    });
  } catch (error) {
    console.error(" Failed to start server:", error.message);
    console.error("Full error:", error);
    process.exit(1);
  }
}

// Start the server
startServer();
