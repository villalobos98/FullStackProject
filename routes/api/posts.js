const express = require("express");
const { validationResult, check } = require("express-validator");
const auth = require("../../middleware/auth");
const router = express.Router();
const Post = require("../../models/Post");
const Profile = require("../../models/Profile");
const User = require("../../models/User");

// route POST /api/posts
// desc: You have have to be logged in to make a post
// @access: Private route, don't need a token
router.post(
  "/",
  [auth, check("text", "Text Required").not().isEmpty()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      // Query the database, logged in, so we have a token, -password, avoid send the user password
      const user = await User.findById(req.user.id).select("-password");

      // Create new Post() model document object, which is a document and can be updated/saved to Mongo
      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      });
      // save the object to MongoDB
      const post = await newPost.save();
      console.log(post);
      // response with post object coverted to JSON
      res.json(post);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

module.exports = router;
