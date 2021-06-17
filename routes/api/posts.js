const express = require('express')
const { validationResult, check } = require('express-validator')
const auth = require('../../middleware/auth')
const { exists } = require('../../models/Post')
const router = express.Router()
const Post = require('../../models/Post')
const Profile = require('../../models/Profile')
const User = require('../../models/User')

// route POST /api/posts
// desc: You have have to be logged in to make a post
// @access: Private route, need a token
router.post(
  '/',
  [auth, check('text', 'Text Required').not().isEmpty()],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }
      // Query the database, logged in, so we have a token, -password, avoid send the user password
      const user = await User.findById(req.user.id).select('-password')

      if (!user) {
        return res.status(400).json({ mes: 'User not found' })
      }

      // Create new Post() model document object, which is a document and can be updated/saved to Mongo
      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      })
      // save the object to MongoDB
      const post = await newPost.save()

      // response with post object coverted to JSON
      res.json(post)
    } catch (err) {
      console.error(err.message)
      res.status(500).send('Server Error')
    }
  }
)

// route GET /api/posts
// desc: This will get all posts that have been submitted but a user.
// @access: Private route, therefore you need a user's token
router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: 'descending' })
    if (!(posts)) {
      return res.json({ mes: 'Posts do not exist' })
    }
    res.json(posts)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error');
  }
})

// route GET /api/posts/:id
// desc: This will get all posts that have been submitted but a user.
// @access: Private route, therefore you need a user's token
router.get('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).sort({
      date: 'descending'
    })
    if (!(post)) {
      return res.status(404).json({ message: 'Post Not Found' })
    }
    res.json(post)
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Post Not Found' })
    }
    res.status(500).send('Server Error')
  }
})

// route DELETE /api/posts/:id
// desc: Delete a post by a user
// @access: Private route, therefore you need a user's token
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)

    // Check if post obj exists
    if (!(post)) {
      return res.status(404).json({ message: 'Post Not Found' })
    }

    // Check if post made by user is the one that is passed into parameters
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' })
    }

    await post.remove()

    res.json({ message: 'Post removed' })
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Post Not Found' })
    }
    res.status(500).send('Server Error')
  }
})


// route PUT /api/posts/like/:id
// desc: When the user interacts with the frontend, it will add to the likes array
// @access: Private route
router.put('/like/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    //Check if post has already been liked by user, by checking if the array contains more than 1 of the same user ID
    if (post.likes.filter(like => console.log(like.user.toString() === req.user.id)).length > 0) {
      return res.status(400).json({ message: 'Post already liked!' })
    }
    //Add user to the likes array, keep track of the user
    post.likes.unshift({ user: req.user.id });

    //Update the model/save the new version of the model
    post.save();

    return res.json(post.likes);
  } catch (err) {
    console.log(err)
    res.status(500).send('Server Error')
  }
})


// route POST /api/posts/unlike/:id
// desc: When the user interacts with the frontend, it will remove likes in the like array
// @access: Private route
router.put('/unlike/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    //Check if post has already been liked by user, by checking if the array contains more than 1 of the same user ID
    if (post.likes.filter(like => console.log(like.user.toString() === req.user.id)).length === 0) {
      return res.status(400).json({ message: 'Post not yet liked!' })
    }
    // Get the user id in an array
    const userIDArray = post.likes.map(like => like.user.toString());

    //Find the correct post, by the correct user who made the post
    const removeIdx = userIDArray.indexOf(req.params.id);
    //Remove the post by the user
    post.likes.splice(removeIdx, 1);

    //Update the model/save the new version of the model
    post.save();
    return res.json(post.likes);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error')
  }
})

// route POST /api/posts/comment/:id
// desc: Comment on post
// @access: Private route, need token
router.post('/comment/:id', [auth, check('text', 'Text Required').not().isEmpty()],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }
      // Note to self, there is a user model/object that exists in the token 
      const user = await User.findById(req.user.id).select('-password')
      // Note to self, there we are using an id, that is in the URI, therefore use params.id
      const post = await Post.findById(req.params.id)
      if (!user) {
        return res.status(400).json({ mes: 'User not found' })
      }
      if (!post) {
        return res.status(400).json({ msg: 'Post does not exist' })
      }

      // Create the comment object that the post will contain
      const newComment = {
        user: user.id,
        name: user.name,
        avatar: user.avatar,
        text: req.body.text
      }

      //Add obj to list 
      post.comments.unshift(newComment);

      //Save the comment to MongoDB
      await post.save()

      // response with post object coverted to JSON
      res.json(post.comments);
    } catch (err) {
      console.error(err.message)
      res.status(500).send('Server Error')
    }
  }
)

// route DELETE /api/comment/:id/post/:id
// desc: Remove a comment on post
// @access: Private route, need token, SLIGHTLY DIFFERENT IDEA
router.delete('/comment/:id/:comment_id', auth, async (req, res) => {

  try {
    //Get the post by the ID
    const post = await Post.findById(req.params.id);

    //Check if the post exists
    if (!post) {
      return res.status(404).json({ msg: 'Post Not Found' })
    }
    //Find the comment to remove 
    const comment = post.comments.find(post => post.id == req.params.comment_id)

    //Check to see if the comment does exist
    if (!comment) {
      return res.status(404).json({ msg: 'Comment Not Found' })
    }
    //Check to see if we have the right user who with their associated post
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User Not Authorized To Remove Post' })
    }
    //Find the index of where to remove the post
    const removeIdx = post.comments.indexOf(comment);
    post.comments.splice(removeIdx, 1);

    //Save the database
    await post.save()

    return res.status(200).json(post.comments)
  }
  catch (error) {
    console.log(error.message)
    res.status(500).json({ msg: 'Internal Server Error' })
  }

})

module.exports = router
