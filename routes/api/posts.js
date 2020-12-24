const express = require('express');
const router = express.Router();

//route GET /api/user
//desc: Route to do
//@access: Public route, don't need a token
router.get('/', (req, res) => res.send('Posts route'));

module.exports = router;
