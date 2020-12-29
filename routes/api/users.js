const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const { check, validation, validationResult } = require('express-validator');
const { Mongoose } = require('mongoose');
const Users = require('../../models/Users');
const User = require('../../models/Users');
const jwt = require('jsonwebtoken');

//route POST /api/users
//desc: DESCRIBE THIS STUFF
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
  //Anon function
  async (req, res) => {
    const errors = validationResult(req);
    //check if the there are any errors in the array
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // get users gravatar
    // encrypt password
    // return jwtoken
    const { name, email, password } = req.body;
    try {
      // See if user exists in the database
      let user = await User.findOne({ email });

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

      user = new User({
        name,
        email,
        avatar,
        password,
      });

      //Whenever there is a promise make sure to use await
      const salt = await bcrypt.genSalt(10);

      user.password = await bcrypt.hash(password, salt);

      await user.save();

      const payload = {
        users: {
          id: user.id
        }
      }
    } catch (err) {
      console.log('The errors are ->>>>>>>>>' + err);
      console.error(err.message);
      res.status(500).send('Server Error');
    }
    //Useful for debugging
  }
);

module.exports = router;
