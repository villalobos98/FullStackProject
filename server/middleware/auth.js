// Exporting a middleware function that has
// request, response, and next object
// get the token from the header, using config
// if the token is not there in a protected route
// then it will throw a message error

const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = function (req, res, next) {
  // Whenever you are creating a protected route
  // Make sure to use a token in the header
  try {
    // Get token from header
    // Note, req.header('x-auth-token') also works
    const token = req.get("x-auth-token");
    if (!token) {
      return res
        .status(401)
        .json({ TokenError: "No token, authorization failed" });
    }
    // Verify Token
    const decoded = jwt.verify(token, config.get("jwtToken"));
    req.user = decoded.user;
    next(); // like with any middleware
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};
