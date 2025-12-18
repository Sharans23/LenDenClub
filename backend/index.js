// Load environment variables
require("dotenv").config();

// Import required packages
const express = require("express");
const cors = require("cors");

// Create Express app
const app = express();

// Middleware
app.use(cors());
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

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/transaction", transactionRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Start server
const PORT = process.env.PORT || 5000;

// Start server without async database init for now
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📌 Test endpoints:`);
  console.log(`   GET  /`);
  console.log(`   GET  /health`);
  console.log(`   POST /api/auth/login`);
});
