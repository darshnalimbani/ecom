const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const { createJwtToken } = require("../utils/token.util");
const { User, Sequelize } = require("../models");

exports.signup = async (req, res, next) => {
  // Validate the request body
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json(errors.array());
  }
  try {
    const { username, email, password } = req.body;

    // Check if a user with the same email already exists
    const userCheck = await User.findOne({
      where: {
        [Sequelize.Op.or]: [{ email }, { username }],
      },
    });
    if (userCheck) {
      return res.status(400).json({ message: "User already exists!!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    // JWT token
    const token = createJwtToken({ user_id: user.id });
    user.token = token;
    return res.status(200).json({
      type: "success",
      message: "Account Created Successfully",
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json(errors.array());
  try {
    const { email, password } = req.body;
    const user = await User.findOne({
      where: {
        email: email.trim(),
      },
      attributes: ["id", "username","email","password"],
    });
    if (!user) {
      return res.status(401).json({
        message: "Sorry we could not find any matching user account.",
      });
    }
    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) {
      return res.status(401).json({ message: "Enter Valid Password" });
    }

    const token = createJwtToken({ user_id: user.id });
    user.token = token;
    await user.save();
    const userObject = user.toJSON();
    delete userObject.password;

    return res.status(200).json({
      type: "success",
      message: "You have successfully logged into your account.",
      user: userObject,
    });
  } catch (err) {
    next(err);
  }
};

exports.logout = async (req, res, next) => {
  const userId = req.user.id;
  try {
    // Clear token from the database
    await User.update({ token: null }, { where: { id: userId } });

    return res.status(200).json({
      type: "success",
      message: "Logged out successfully...",
    });
  } catch (err) {
    next(err);
  }
};
