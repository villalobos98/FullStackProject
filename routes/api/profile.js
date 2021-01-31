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

    const {
      company,
      website,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin,
    } = req.body;

    const profileFields = {};
    //Known just from the token that was sent
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {
      profileFields.skills = skills.split(',').map((skill) => skill.trim());
      console.log(profileFields.skills);
    }

    //Store the social links a seperate object, called social, inside 'profilefields'
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (facebook) profileFields.social.facebook = facebook;
    if (twitter) profileFields.social.twitter = twitter;
    if (instagram) profileFields.social.instagram = instagram;
    if (twitter) profileFields.social.twitter = twitter;
    if (linkedin) profileFields.social.linkedin = linkedin;

    try {
      // request.user.id comes from teh token
      // whenver we are using a mongoose method, we need to use await
      let profile = await Profile.findOne({ user: req.user.id });

      //If there profile that is in the database, then update the local fields created here,
      //using the values passed into the body
      //from the user and then return the profile in JSON format
      if (profile) {
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
        return res.json(profile);
      }

      //Otherwise, there is no profile, so create one
      profile = new Profile(profileFields);
      await profile.save();
      return res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

//route GET /api/profile
//desc: Get all profiles
//@access: Public

router.get('/', async (req, res) => {
  try {
    //Populting the User Object with the items in the array for all profiles
    const profiles = await Profile.find().populate('user', [
      'name',
      'avatar',
      '_id',
    ]);
    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

//route GET /api/profile/user/:user_id
//desc: Get profile by user ID
//@access: Public
router.get('/user/:user_id', async (req, res) => {
  try {
    //Get only one user back, so use findOne, URL contains the user id so use params.user_id
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate('user', ['name', 'avatar']);

    //If no profile exist make sure to send a message to the user
    if (!profile) {
      return res.status(400).json({ msg: 'Profile Not Found' });
    }
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    //Check if the error is with the object ID, meaning malformed, too short, too long, or unproper
    if (err.kind == 'ObjectId') {
      return res.status(400).json({ msg: 'Profile Not Found' });
    }
    res.status(500).send('Server Error');
  }
});

//route DELETE /api/profile
//desc: Delete profile, user and posts
//@access: Private

router.delete('/', auth, async (req, res) => {
  try {
    // @todo - remove a user's post

    //Remove Profile
    await Profile.findOneAndRemove({ user: req.user.id });
    //Remove User
    await User.findOneAndRemove({ _id: req.user.id });

    const profile = await Profile.findOne({ user: req.user.id });
    const user = await User.findOne({ _id: req.user.id });
    if (!user && !profile) {
      res.json({ msg: 'User removed' });
    }

    // res.json({ msg: "User removed"});
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

//route PUT /api/profile/experience
//desc: Add Profile experience
//@access: Private
router.put(
  '/experience',
  [
    auth,
    //This checks to make sure that certain fields are required in the body of request
    [
      check('title', 'Title is required').not().isEmpty(),
      check('company', 'Company is required').not().isEmpty(),
      check('from', 'From date is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty) {
        return res.status(400).json({ errors: errors.array });
      }

      const {
        title,
        company,
        location,
        from,
        to,
        current,
        description,
      } = req.body;

      const exp = {
        title,
        company,
        location,
        from,
        to,
        current,
        description,
      };

      const profile = await Profile.findOne({ user: req.user.id });

      profile.experience.unshift(exp);
      console.log(profile.experience);
      await profile.save();

      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

//route DELETE /api/profile/experience/:exp_id
//desc: Delete experience from Profile
//@access: Private
router.delete('/experience/:exp_id', auth, async (req, res) => {
  //Get the profile of the logged in user
  const profile = await Profile.findOne({ user: req.user.id });

  //Get remove index, not sure how really
  const idx = profile.experience
    .map((item) => item.id)
    .indexOf(req.params.exp_id);

  //This starts to splice, meaning removes item given idx, and quantity to remove
  profile.experience.splice(idx, 1);

  //Update the database to reflect changes
  await profile.save();

  //Return the entire profile scheme to user
  res.json(profile);
});

//route PUT /api/profile/experience/:exp_id
//desc: Update experience of user Profile
//@access: Private
router.put(
  '/experience/:exp_id',
  auth,
  [
    check('title', 'Title is required').not().isEmpty(),
    check('company', 'Company is required').not().isEmpty(),
    check('from', 'From date is required').not().isEmpty(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty) {
        return res.status(400).json({ errors: errors.array });
      }

      //destructure from the req.body
      const {
        title,
        company,
        location,
        from,
        to,
        current,
        description,
      } = req.body;

      //Get the profile of the logged in user
      const profile = await Profile.findOne({ user: req.user.id });

      //Get the update index
      const idx = profile.experience
        .map((item) => item.id)
        .indexOf(req.params.exp_id);

      //The user profile javascript object
      userProfile = profile.experience[idx];
      console.log(userProfile);

      //Check if the fields exist so we can then replace
      if (title) userProfile.title = title;
      if (company) userProfile.company = company;
      if (location) userProfile.location = location;
      if (from) userProfile.from = from;
      if (to) userProfile.to = to;
      if (current) userProfile.current = current;
      if (description) userProfile.description = description;

      console.log(userProfile);
      //Save to the database
      await profile.save();

      //Return the profile
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

module.exports = router;
