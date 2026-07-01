const jwt = require("jsonwebtoken");
const AdminUser = require("../models/AdminUser");

async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Not authorized, no token provided" });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await AdminUser.findById(decoded.id).select("-password");
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: "Not authorized, user not found or inactive" });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Not authorized, invalid token" });
  }
}

// Restricts a route to specific roles, e.g. requireRole('superadmin')
function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Forbidden: insufficient permissions" });
    }
    next();
  };
}

module.exports = { protect, requireRole };
