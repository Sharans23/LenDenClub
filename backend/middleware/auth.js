const jwt = require("jsonwebtoken");

// Authentication middleware
const authenticate = (req, res, next) => {
  // Get token from header
  const token = req.header("Authorization");

  // Check if no token
  if (!token) {
    return res.status(401).json({
      error: "Access denied. No token provided.",
    });
  }

  // Remove "Bearer " if present
  const actualToken = token.replace("Bearer ", "");

  try {
    // Verify token
    const decoded = jwt.verify(actualToken, process.env.JWT_SECRET);

    // Add user info to request
    req.user = decoded;

    // Continue to next middleware/route
    next();
  } catch (err) {
    res.status(400).json({
      error: "Invalid token.",
    });
  }
};

module.exports = authenticate;
