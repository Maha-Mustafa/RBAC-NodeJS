const express = require('express');
const User = require('../models/user');
const router = express.Router();
const mongoose = require('mongoose');

router.get('/users', async(req,res,next) =>{
    try {
      const users = await User.find();
      // res.send(users);
      res.render('manage-users', {users});
      //rendering out the manage users page and passing an object which contains all the users 
      //so we can use it in manage-users.ejs
    } catch (error) {
        next(error);
    }
})
router.get('/user/:id', async(req,res,next) =>{
  try {
    const {id} = req.params;
    if(!mongoose.Types.ObjectId.isValid(id)){
      req.flash('warning', 'Id is invalid');
      res.redirect('/admin/users');
      return;
    }
    const person = await User.findById(id);
    res.render('profile', {person});
  } catch (error) {
    next(error)
  }
})
module.exports = router;