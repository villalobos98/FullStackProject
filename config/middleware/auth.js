// const jwt = require('jsonwebtoken')
// const config = require('config')

export default function (req, res, _next) {
  try {
    // Get token from header
    const token = req.header('x-auth-token')
    // Check if there is no token
    if (!token) res.status(401).json({ msg: 'No token, authorization denied' })
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: 'Internal Server Error' })
  }
}
