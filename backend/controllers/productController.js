const Product = require("../models/Product");
const { asyncHandler } = require("../middleware/errorHandler");

// GET /api/products?category=&search=&isAvailable=
const getProducts = asyncHandler(async (req, res) => {
  const { category, search, isAvailable } = req.query;
  const filter = {};
  if (category) filter.category = category;
  if (isAvailable !== undefined) filter.isAvailable = isAvailable === "true";
  if (search) filter.$text = { $search: search };

  const products = await Product.find(filter).populate("category", "name emoji").sort({ createdAt: -1 });
  res.json({ success: true, count: products.length, data: products });
});

const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate("category", "name emoji");
  if (!product) return res.status(404).json({ success: false, message: "Product not found" });
  res.json({ success: true, data: product });
});

const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, data: product });
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) return res.status(404).json({ success: false, message: "Product not found" });
  res.json({ success: true, data: product });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: "Product not found" });
  res.json({ success: true, message: "Product deleted" });
});

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct };
