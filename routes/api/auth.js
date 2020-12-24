const express = require('express');
const router = express.Router();

//route GET /api/auth
//desc: Test Route
//@access: Public route, don't need a token
//Note to self, the order of the req, res in the
//anonymous function actually matters, it must be
//req, res
router.get('/', (req, res) => res.send('Auth route'));

module.exports = router;
