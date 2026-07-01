require("dotenv").config();
const mongoose = require("mongoose");
const Category = require("../models/Category");
const Product = require("../models/Product");
const AdminUser = require("../models/AdminUser");
const logger = require("./logger");

const categoryData = [
  { name: "Cakes", emoji: "🎂", displayOrder: 1 },
  { name: "Birthday Cakes", emoji: "🎉", displayOrder: 2 },
  { name: "Pastries", emoji: "🥐", displayOrder: 3 },
  { name: "Puffs", emoji: "🥟", displayOrder: 4 },
  { name: "Sandwiches", emoji: "🥪", displayOrder: 5 },
  { name: "Bread", emoji: "🍞", displayOrder: 6 },
  { name: "Cookies", emoji: "🍪", displayOrder: 7 },
  { name: "Beverages", emoji: "🥤", displayOrder: 8 },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  logger.info("Connected to MongoDB for seeding...");

  await Category.deleteMany({});
  await Product.deleteMany({});

  const categories = await Category.insertMany(categoryData);
  const byName = Object.fromEntries(categories.map((c) => [c.name, c._id]));

  const products = [
    { name: "Chocolate Truffle Cake (1kg)", category: byName["Cakes"], price: 650, unit: "cake", isTodaysSpecial: true },
    { name: "Red Velvet Cake (1kg)", category: byName["Cakes"], price: 700, unit: "cake" },
    { name: "Pineapple Cake (1kg)", category: byName["Cakes"], price: 500, unit: "cake" },
    { name: "Photo Birthday Cake (1kg)", category: byName["Birthday Cakes"], price: 850, unit: "cake" },
    { name: "Number Shaped Cake", category: byName["Birthday Cakes"], price: 950, unit: "cake" },
    { name: "Veg Puff", category: byName["Puffs"], price: 30, unit: "piece" },
    { name: "Egg Puff", category: byName["Puffs"], price: 35, unit: "piece" },
    { name: "Chicken Puff", category: byName["Puffs"], price: 45, unit: "piece" },
    { name: "Butter Croissant", category: byName["Pastries"], price: 60, unit: "piece" },
    { name: "Chocolate Pastry", category: byName["Pastries"], price: 55, unit: "piece", isTodaysSpecial: true },
    { name: "Veg Sandwich", category: byName["Sandwiches"], price: 70, unit: "piece" },
    { name: "Grilled Cheese Sandwich", category: byName["Sandwiches"], price: 90, unit: "piece" },
    { name: "Milk Bread Loaf", category: byName["Bread"], price: 55, unit: "loaf" },
    { name: "Multigrain Bread", category: byName["Bread"], price: 65, unit: "loaf" },
    { name: "Butter Cookies (250g)", category: byName["Cookies"], price: 120, unit: "pack" },
    { name: "Choco Chip Cookies (250g)", category: byName["Cookies"], price: 140, unit: "pack" },
    { name: "Cold Coffee", category: byName["Beverages"], price: 80, unit: "glass" },
    { name: "Fresh Lime Soda", category: byName["Beverages"], price: 50, unit: "glass" },
  ];

  await Product.insertMany(products);
  logger.info(`Seeded ${categories.length} categories and ${products.length} products.`);

  const adminEmail = (process.env.ADMIN_EMAIL || "admin@bakery.com").toLowerCase();
  const existingAdmin = await AdminUser.findOne({ email: adminEmail });
  if (!existingAdmin) {
    await AdminUser.create({
      name: "Bakery Admin",
      email: adminEmail,
      password: process.env.ADMIN_PASSWORD || "Admin@123",
      role: "superadmin",
    });
    logger.info(`Admin user created: ${adminEmail}`);
  } else {
    logger.info("Admin user already exists, skipping.");
  }

  await mongoose.disconnect();
  logger.info("Seeding complete.");
}

seed().catch((err) => {
  logger.error(`Seeding failed: ${err.message}`);
  process.exit(1);
});
