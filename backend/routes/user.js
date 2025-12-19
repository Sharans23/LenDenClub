const express = require("express");
const authenticate = require("../middleware/auth");
const { User } = require("../models");
const bcrypt = require("bcryptjs");
const router = express.Router();

// GET /profile - Get user profile
router.get("/profile", authenticate, async (req, res) => {
  try {
    // First try to get user with all fields
    let user;
    try {
      user = await User.findByPk(req.user.id, {
        attributes: { exclude: ["password"] },
      });
    } catch (dbError) {
      // If that fails due to missing columns, get only basic fields
      console.log("Falling back to basic user query:", dbError.message);
      user = await User.findByPk(req.user.id, {
        attributes: ["id", "username", "balance"],
      });
    }

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Build response with defaults for missing fields
    const userResponse = {
      id: user.id,
      username: user.username,
      email: user.email || `${user.username}@example.com`,
      fullName: user.fullName || `User ${user.username}`,
      phone: user.phone || "Not set",
      balance: user.balance,
      createdAt: user.createdAt || new Date().toISOString(),
      updatedAt: user.updatedAt || new Date().toISOString(),
    };

    res.json({
      success: true,
      user: userResponse,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch profile",
      message:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// PUT /profile - Update user profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { email, fullName, phone } = req.body;
    
    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update fields if provided
    if (email !== undefined) user.email = email;
    if (fullName !== undefined) user.fullName = fullName;
    if (phone !== undefined) user.phone = phone;
    
    // Save to database
    await user.save();
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        balance: user.balance,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
    
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to update profile'
    });
  }
});
// PUT /change-password - Change password
router.put("/change-password", authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: "New password must be at least 6 characters",
      });
    }

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        error: "Current password is incorrect",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    await user.save();

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to change password",
      message:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

module.exports = router;
