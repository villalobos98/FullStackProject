const express = require('express');
const router = express.Router();

//route POST /api/posts
//desc: Register User
//@access: Public route, don't need a token
router.post('/', (req, res) => {
  console.log(req.body);
  res.send('Posts route');
});

module.exports = router;
