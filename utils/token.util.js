const jwt = require("jsonwebtoken");
const { JWT_DECODE_ERR } = require("../config/errors");

exports.createJwtToken = (payload, expiresIn = "120000000h") => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
  return token;
};

exports.verifyJwtToken = (token, next) => {
    try {
        const { user_id } = jwt.verify(token, process.env.JWT_SECRET);
        return { user_id };
    } catch (err) {
        throw new Error(JWT_DECODE_ERR);
    }
};