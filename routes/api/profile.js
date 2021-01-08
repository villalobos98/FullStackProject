const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const { check, validationResult } = require('express-validator');

//route GET /api/profile/me
//desc: Get a User's profile
//@access: Private route, because you need a token to access the profile
//          aka need to include the authentication middleware

router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate('user', ['name', 'avatar']);

    //Check if there isn't a profile
    if (!profile) {
      return res.status(400).json({ msg: 'There is no profile for this user' });
    }

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

//route POST /api/profile
//desc: Create or update a user profile
//@access: Private route, because you need a token to access the profile
//          aka need to include the authentication middleware

router.post(
  '/',
  [
    auth,
    [
      check('status', 'Status is required.').not().isEmpty(),
      check('skills', 'Skills is required.').not().isEmpty(),
    ],
  ],

  async (req, res) => {
    const errors = validationResult(req);

    //If there is some issue then have the server respond in a proper way
    if (!errors.isEmpty()) {
      return res.status(500).json({ errors: errors.array() });
    }

    //If everything is all good
    return res.status(200).json({ msg: 'Good Job, user' });
  }
);

module.exports = router;
