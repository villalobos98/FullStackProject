const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = function (req, res, next) {
  // Get token from header
  const token = req.header("x-auth-token");

  // Check if there is no token
  if (!token) {
    res.status(401).json({ msg: "No token, autorization denied" });
  }
};
