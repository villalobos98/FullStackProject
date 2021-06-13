// const jwt = require('jsonwebtoken')
// const config = require('config')

module.exports = function (req, res, _next) {
  try {
    // Get token from header
    const token = req.header('x-auth-token');
  } catch {
    // Check if there is no token
    if (!token) {
      res.status(401).json({ msg: 'No token, autorization denied' })
    }
  }
}
