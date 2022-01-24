const express = require('express');
const router = express.Router();

router.get('/profile', async(req,res,next) =>{
    // res.send('user profile')
    //getting user info from req object
    const person = req.user;
    res.render('profile', {person})
})
module.exports = router;