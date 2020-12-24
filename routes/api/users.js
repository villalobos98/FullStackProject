const express = require('express');
const router = express.Router();

//route POST /api/users
//desc: DESCRIBE THIS STUFF
//@access: Public route, don't need a token
router.post('/', (req, res) => {
    console.log(req.body);
    res.send('User route');
});

module.exports = router;
