const express = require('express');
const router = express.Router();

//route GET /api/profile
//desc: Test Route
//@access: Public route, don't need a token
router.get('/', (req, res) => res.send('Profile route'));

module.exports = router;
