const express = require('express');
const router = express.Router();

//route GET /api/user
//desc: DESCRIBE THIS STUFF
//@access: Public route, don't need a token
router.get('/', (req, res) => res.send('User route'));

module.exports = router;
