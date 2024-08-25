const express = require("express");
const router = express.Router();
const validate = require("../middleware/validations");
const { signup, login, logout } = require("../controllers/auth.controller");
const authenticate = require("../middleware/authenticate");

// Signup
router.post("/signup", validate.signup, signup);

// Login
router.post("/login", login);

// Logout
router.post("/logout", authenticate, logout);

module.exports = router;