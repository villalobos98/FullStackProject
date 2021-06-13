const express = require("express");
const { validationResult, check } = require("express-validator");
const auth = require("../../middleware/auth");
const { exists } = require("../../models/Post");
const router = express.Router();
const Post = require("../../models/Post");
const Profile = require("../../models/Profile");
const User = require("../../models/User");

// route POST /api/posts
// desc: You have have to be logged in to make a post
// @access: Private route, need a token
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


// route GET /api/posts
// desc: This will get all posts that have been submitted but a user.
// @access: Private route, therefore you need a user's token 
router.get(
  "/", auth,
  async (req, res) => {
    try {
      const posts = await Post.find().sort({date: 'descending'});
      res.json(posts);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// route GET /api/posts/:id
// desc: This will get all posts that have been submitted but a user.
// @access: Private route, therefore you need a user's token 
router.get(
  "/:id", auth,
  async (req, res) => {
    try {
      const post = await Post.findById(req.params.id).sort({ date: 'descending' });
      if (!post){
        return res.status(404).json({ message: "Post Not Found" });
      }
      res.json(post);
    } catch (err) {
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ message: "Post Not Found" });
      }
      res.status(500).send("Server Error");
    }
  }
);


// route DELETE /api/posts/:id
// desc: Delete a post by a user
// @access: Private route, therefore you need a user's token 
router.delete("/:id", auth, async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      
      // Check if post obj exists
      if (!post){
        return res.status(404).json({ message: "Post Not Found" });
      }

      // Check if post made by user is the one that is passed into parameters
      if (post.user.toString() !== req.user.id) {
        return res.status(401).json({ message: "User not authorized" });
      }

      await post.remove();


      res.json(post);
    } catch (err) {
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ message: "Post Not Found" });
      }
      res.status(500).send("Server Error");
    }
  }
);



module.exports = router;
