const express = require("express");
const pool = require("../config/db");
const router = express.Router();

// Get all products list
router.get("/", async (req, res) => {
  try {
    const products = await pool.query(
      "SELECT * FROM products"
    );
    res.status(201).json({ message: "List of Products fetched successfully...", data:products?.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
