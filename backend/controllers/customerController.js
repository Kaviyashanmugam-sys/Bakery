const Customer = require("../models/Customer");
const Order = require("../models/Order");
const { asyncHandler } = require("../middleware/errorHandler");

// GET /api/customers?search=
const getCustomers = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const filter = search ? { $text: { $search: search } } : {};
  const customers = await Customer.find(filter).sort({ lastOrderAt: -1 });
  res.json({ success: true, count: customers.length, data: customers });
});

const getCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) return res.status(404).json({ success: false, message: "Customer not found" });
  const orders = await Order.find({ customer: customer._id }).sort({ createdAt: -1 });
  res.json({ success: true, data: { customer, orders } });
});

const updateCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!customer) return res.status(404).json({ success: false, message: "Customer not found" });
  res.json({ success: true, data: customer });
});

const toggleBlockCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) return res.status(404).json({ success: false, message: "Customer not found" });
  customer.isBlocked = !customer.isBlocked;
  await customer.save();
  res.json({ success: true, data: customer });
});

module.exports = { getCustomers, getCustomer, updateCustomer, toggleBlockCustomer };
