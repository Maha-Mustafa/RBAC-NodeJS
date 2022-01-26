const express = require('express');
const User = require('../models/user');
const router = express.Router();
const mongoose = require('mongoose');
const { roles } = require('../utils/constants');

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
router.post('/update-role', async(req,res, next) =>{
  try {
    const {id, role} = req.body;
  //checking for valid id and role
  if(!id || !role){
    req.flash('error', 'Invalid request');
    return res.redirect('back')
  }
  //check for valid mongoose object id
  if(!mongoose.Types.ObjectId.isValid(id)){
    req.flash('error', 'Invalid id');
    return res.redirect('back')
  }
  //check for valid role
  const rolesArray = Object.values(roles)
  if(!rolesArray.includes(role)){
    req.flash('error', 'Invalid role');
    return res.redirect('back')
  }
  //admin cannot remove themselve as an admin
  if(req.user.id === id){
    req.flash('error', 'Admins cannot remove themselves from Admin ask another admin.');
    return res.redirect('back')
  }
  //finally update the user
  const user = await User.findByIdAndUpdate(id, {role}, {new: true, runValidators:true})
  req.flash('info', `updated role for ${user.email} to ${user.role}`);
  // res.redirect('/admin/users')
  res.redirect('back');
  } catch (error) {
    next(error)
  }
  
})
module.exports = router;