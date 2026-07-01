const { body, validationResult } = require("express-validator");

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
  }
  next();
}

const validateProduct = [
  body("name").trim().notEmpty().withMessage("Product name is required"),
  body("category").notEmpty().withMessage("Category is required"),
  body("price").isFloat({ min: 0 }).withMessage("Price must be a positive number"),
  handleValidation,
];

const validateCategory = [
  body("name").trim().notEmpty().withMessage("Category name is required"),
  handleValidation,
];

const validateLogin = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
  handleValidation,
];

module.exports = { validateProduct, validateCategory, validateLogin, handleValidation };
