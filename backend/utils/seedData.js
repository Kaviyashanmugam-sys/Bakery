require("dotenv").config();
const mongoose = require("mongoose");
const Category = require("../models/Category");
const Product = require("../models/Product");
const AdminUser = require("../models/AdminUser");
const logger = require("./logger");

// Full bakery content (categories, products, bakery info) lives in a single JSON
// file so non-developers can edit menu items without touching code.
// See: docs/BAKERY_CONTENT.md for how to customize this file.
const bakeryContent = require("../data/bakery-content.json");

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  logger.info("Connected to MongoDB for seeding...");

  await Category.deleteMany({});
  await Product.deleteMany({});

  const categories = await Category.insertMany(
    bakeryContent.categories.map((c) => ({
      name: c.name,
      emoji: c.emoji,
      description: c.description,
      displayOrder: c.displayOrder,
    }))
  );
  const byName = Object.fromEntries(categories.map((c) => [c.name, c._id]));

  const products = bakeryContent.products.map((p) => ({
    name: p.name,
    category: byName[p.category],
    price: p.price,
    unit: p.unit,
    description: p.description || "",
    isVeg: p.isVeg !== undefined ? p.isVeg : true,
    isTodaysSpecial: !!p.isTodaysSpecial,
    isAvailable: true,
  }));

  const missingCategory = products.filter((p) => !p.category);
  if (missingCategory.length) {
    logger.error(`${missingCategory.length} product(s) reference a category not found in categories list — check data/bakery-content.json`);
  }

  await Product.insertMany(products.filter((p) => p.category));
  logger.info(`Seeded ${categories.length} categories and ${products.length} products from ${bakeryContent.bakeryInfo.name}.`);

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
