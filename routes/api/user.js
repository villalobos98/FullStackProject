const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const { check, validation, validationResult } = require('express-validator');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const config = require('config');

//route POST /api/users
//Desc:
//Notes
//@access: Public route, don't need a token
router.post(
  '/',
  [
    check('name', 'Please include a valid username').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check(
      'password',
      'Please include a password with 10 or more characters'
    ).isLength({ min: 10 }),
  ],

  async (req, res) => {
    const errors = validationResult(req);
    //check if the there are any errors in the array
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;
    try {
      let user = await User.findOne({ email });

      // See if user exists in the database
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'User already exists' }] });
      }

      console.log(req.body);
      const avatar = gravatar.url(email, {
        s: 200,
        r: 'pg',
        d: 'mm',
      });

      // Create the user
      user = new User({
        name,
        email,
        avatar,
        password,
      });

      //Hash the password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      //Save user to the database.
      await user.save();

      //Create the payload
      const payload = {
        user: {
          id: user.id,
        },
      };

      //Sign the token
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
