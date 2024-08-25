const express = require("express");
const { Product } = require("../models");
const router = express.Router();

// Get all products list
router.get("/", async (req, res) => {
  try {
    const products = await Product.findAll();
    res.status(201).json({ message: "List of Products fetched successfully...", products });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
