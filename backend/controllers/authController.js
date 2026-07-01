const jwt = require("jsonwebtoken");
const AdminUser = require("../models/AdminUser");
const { asyncHandler } = require("../middleware/errorHandler");

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required" });
  }

  const user = await AdminUser.findOne({ email: email.toLowerCase() });
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ success: false, message: "Invalid email or password" });
  }
  if (!user.isActive) {
    return res.status(403).json({ success: false, message: "This account has been deactivated" });
  }

  const token = signToken(user);
  res.json({
    success: true,
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

// GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});

module.exports = { login, getMe };
