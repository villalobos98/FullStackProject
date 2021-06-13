const mongoose = require('mongoose')
const Schema = mongoose.Schema

const PostSchema = new Schema({
  // a User
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users'
  },
  // The text that is in the post, will come from the body of the request
  text: {
    type: String,
    required: true
  },
  // Name of the user
  name: {
    type: String
  },
  // Avatar of the user
  avatar: {
    type: String
  },
  // User can like the post, needs to ref user, so that we know which user liked which post
  // User objectId included so we avoid infinite likes
  likes: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
      }
    }
  ],
  date: {
    type: Date,
    default: Date.now
  },

  // Add comments to posts associated with a user
  comments: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
      },
      text: {
        type: String,
        required: true
      },
      name: {
        type: String
      },
      avatar: {
        type: String
      },
      date: {
        type: Date
      }
    }
  ]
})

module.exports = Post = mongoose.model('posts', PostSchema)
