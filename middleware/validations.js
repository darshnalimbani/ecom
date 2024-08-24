const { check } = require("express-validator");

exports.signup = [
  check("username", "Please provide a valid name").isString().notEmpty(),
  check("email", "Please provide a valid email").isEmail(),
  check("password", "Please provide a password").isString().notEmpty(),
];

exports.checkout = [
  check("address", "Please enter valid address.").isString().notEmpty(),
  check("phone_number", "Please provide a phone number of 10 digits").isString().notEmpty().isLength(10),
  check("payment_method", "Please enter valid payment method like COD, UPI, Card.").isString().notEmpty(),
];