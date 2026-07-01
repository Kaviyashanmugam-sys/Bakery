const Category = require("../models/Category");
const Product = require("../models/Product");
const { asyncHandler } = require("../middleware/errorHandler");

const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ displayOrder: 1 });
  res.json({ success: true, data: categories });
});

const createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create(req.body);
  res.status(201).json({ success: true, data: category });
});

const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!category) return res.status(404).json({ success: false, message: "Category not found" });
  res.json({ success: true, data: category });
});

const deleteCategory = asyncHandler(async (req, res) => {
  const productCount = await Product.countDocuments({ category: req.params.id });
  if (productCount > 0) {
    return res.status(400).json({
      success: false,
      message: `Cannot delete: ${productCount} product(s) still belong to this category`,
    });
  }
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) return res.status(404).json({ success: false, message: "Category not found" });
  res.json({ success: true, message: "Category deleted" });
});

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
