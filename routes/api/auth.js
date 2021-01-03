const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');
//route GET /api/auth
//desc: Test Route
//@access: Public route, don't need a token
//Note to self, the order of the req, res in the
//anonymous function actually matters, it must be
//req, res
router.get('/', auth, async (req, res) => {
  try {
    //The user from the database
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
