const { verifyJwtToken } = require("../utils/token.util");
const {
  AUTH_TOKEN_MISSING_ERR,
  AUTH_HEADER_MISSING_ERR,
  JWT_DECODE_ERR,
  USER_NOT_FOUND_ERR,
} = require("../config/errors");
const { User } = require("../models");
require("dotenv").config();

const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header) {
      return res.status(403).json({ error: AUTH_HEADER_MISSING_ERR });
    }

    // Verify auth token
    const token = header.split("Bearer ")[1];
    if (!token) {
      return res.status(403).json({ error: AUTH_TOKEN_MISSING_ERR });
    }

    const decoded = verifyJwtToken(token);
    if (!decoded || !decoded.user_id) {
      return res.status(403).json({ error: JWT_DECODE_ERR });
    }

    const userId = decoded.user_id;
    let user = await User.findOne({
      where: { id: userId, token: token },
    });

    if (!user) {
      return res.status(401).json({ error: USER_NOT_FOUND_ERR });
    }

    req.user = user;
    req.userId = user.id;
    res.locals.user = user;

    next();
  } catch (err) {
    console.error("Auth Error:", err);
    res.status(400).json({ error: "Invalid token." });
  }
};

module.exports = authenticate;