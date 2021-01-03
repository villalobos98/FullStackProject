//Exporting a middleware function that has
//request, response, and next object
//get the token from the header, using config
//if the token is not there in a protected route
//then it will throw a message error

const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function (req, res, next) {
  //Whenever you are creating a protected route
  //Make sure to use a token in the header
  //Get token from header
  const token = req.header('x-auth-token');

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization failed' });
  }

  // Verify Token
  try {
    const decoded = jwt.verify(token, config.get('jwtToken'));
    req.user = decoded.user;
    next(); //like with any middleware
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
