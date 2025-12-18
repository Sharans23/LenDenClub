const express = require("express");
const authenticate = require("../middleware/auth");
const { User, AuditLog } = require("../models");
const sequelize = require("../config/database");
const { Op } = require("sequelize"); // ✅ Import Op correctly

const router = express.Router();

// POST /transfer
router.post("/transfer", authenticate, async (req, res) => {
  const { receiverId, amount } = req.body;
  const senderId = req.user.id;

  console.log("Transfer request:", { senderId, receiverId, amount });

  // Input validation
  if (!receiverId || !amount) {
    return res.status(400).json({
      error: "Receiver ID and amount are required",
    });
  }

  if (amount <= 0) {
    return res.status(400).json({
      error: "Amount must be greater than 0",
    });
  }

  if (senderId === receiverId) {
    return res.status(400).json({
      error: "Cannot transfer to yourself",
    });
  }

  // Start database transaction
  const transaction = await sequelize.transaction();

  try {
    // Get sender
    const sender = await User.findOne({
      where: { id: senderId },
      transaction,
    });

    // Get receiver
    const receiver = await User.findOne({
      where: { id: receiverId },
      transaction,
    });

    // Check if receiver exists
    if (!receiver) {
      await transaction.rollback();
      return res.status(404).json({
        error: "Receiver not found",
      });
    }

    // Check if sender has enough balance
    if (parseFloat(sender.balance) < parseFloat(amount)) {
      await transaction.rollback();
      return res.status(400).json({
        error: "Insufficient balance",
      });
    }

    // Update balances
    const amountNum = parseFloat(amount);
    sender.balance = parseFloat(sender.balance) - amountNum;
    receiver.balance = parseFloat(receiver.balance) + amountNum;

    // Save updated balances
    await sender.save({ transaction });
    await receiver.save({ transaction });

    // Create audit log entry
    await AuditLog.create(
      {
        sender_id: senderId,
        receiver_id: receiverId,
        amount: amountNum,
        status: "SUCCESS",
      },
      { transaction }
    );

    // Commit transaction
    await transaction.commit();

    // Send success response
    res.json({
      message: "Transfer successful",
      newBalance: sender.balance,
      transferDetails: {
        from: sender.username,
        to: receiver.username,
        amount: amountNum,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    // Rollback transaction on error
    await transaction.rollback();

    // Log failed transfer
    await AuditLog.create({
      sender_id: senderId,
      receiver_id: receiverId,
      amount: parseFloat(amount),
      status: "FAILED",
    });

    console.error("Transfer error:", error);
    res.status(500).json({
      error: "Transfer failed",
      details: error.message,
    });
  }
});

// GET /transactions - Get user's transaction history
router.get("/transactions", authenticate, async (req, res) => {
  const userId = req.user.id;

  console.log("Fetching transactions for user ID:", userId);

  try {
    // Get all transactions where user is sender or receiver
    const logs = await AuditLog.findAll({
      where: {
        [Op.or]: [
          // ✅ Use Op from Sequelize
          { sender_id: userId },
          { receiver_id: userId },
        ],
      },
      order: [["timestamp", "DESC"]],
      raw: true,
    });

    console.log("Found", logs.length, "transactions");

    if (logs.length > 0) {
      console.log("Sample transaction:", logs[0]);
    }

    // Format response
    const formattedTransactions = await Promise.all(
      logs.map(async (tx) => {
        let counterparty = "Unknown";

        try {
          if (tx.sender_id === userId) {
            // User sent money, get receiver's username
            const receiver = await User.findByPk(tx.receiver_id);
            counterparty = receiver
              ? receiver.username
              : `User ${tx.receiver_id}`;
          } else {
            // User received money, get sender's username
            const sender = await User.findByPk(tx.sender_id);
            counterparty = sender ? sender.username : `User ${tx.sender_id}`;
          }
        } catch (error) {
          console.error("Error fetching counterparty:", error);
        }

        return {
          id: tx.id,
          type: tx.sender_id === userId ? "DEBIT" : "CREDIT",
          amount: parseFloat(tx.amount),
          counterparty: counterparty,
          timestamp: tx.timestamp,
          status: tx.status,
          senderId: tx.sender_id,
          receiverId: tx.receiver_id,
        };
      })
    );

    res.json({
      success: true,
      count: formattedTransactions.length,
      transactions: formattedTransactions,
    });
  } catch (error) {
    console.error("Get transactions error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch transactions",
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

// GET /balance - Get current balance
router.get("/balance", authenticate, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    res.json({
      balance: user.balance,
      username: user.username,
    });
  } catch (error) {
    console.error("Balance error:", error);
    res.status(500).json({
      error: "Failed to get balance",
    });
  }
});

module.exports = router;
