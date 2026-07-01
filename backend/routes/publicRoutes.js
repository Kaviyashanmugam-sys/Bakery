const express = require("express");
const router = express.Router();
const {
  getPublicCategories,
  getPublicProducts,
  getPublicOrderStatus,
  createPublicOrder,
} = require("../controllers/publicController");

// No auth middleware on this router — intentionally public.
// Matches the flat API surface requested: GET /categories, GET /products,
// POST /orders, GET /order-status (all mounted here under /api/public/*
// to keep them clearly separate from the JWT-protected admin CRUD APIs).
router.get("/categories", getPublicCategories);
router.get("/products", getPublicProducts);
router.get("/order-status/:orderId", getPublicOrderStatus);
router.post("/orders", createPublicOrder);

module.exports = router;
