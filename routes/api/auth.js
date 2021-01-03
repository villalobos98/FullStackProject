const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('config');

// @route    GET api/auth
// @desc     Get user by token
// @access   Private
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

//route POST /api/auth
//desc: Authenticate User and get Token
router.post(
  '/',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ],

  async (req, res) => {
    const errors = validationResult(req);

    //check if the there are any errors in the body of the request
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });

      // See if user exists in the database
      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid Credentials' }] });
      }

      const isMatching = bcrypt.compare(password, user.password);

      if (!isMatching) {
        return res.status(400).json([{ msg: 'Invalid Credentials' }]);
      }

      //Create the payload
      const payload = {
        user: {
          id: user.id,
        },
      };

      //Sign the token, and if nothing goes wrong then send back the token
      jwt.sign(
        payload,
        config.get('jwtToken'),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) {
            throw err;
          } else {
            res.json({ token });
          }
        }
      );

      //If there is an error server responds with message
    } catch (err) {
      // Useful for debugging
      // console.log(err);
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);
module.exports = router;
