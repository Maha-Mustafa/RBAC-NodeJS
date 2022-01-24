const express = require('express');
const User = require('../models/user');
const router = express.Router();
const {body, validationResult} = require('express-validator');
const passport = require('passport');
const connectEnsure = require('connect-ensure-login');

router.get('/login', connectEnsure.ensureLoggedOut({redirectTo:'/'}), async(req, res, next) =>{
    res.render('login')
})

router.post('/login',connectEnsure.ensureLoggedOut({redirectTo:'/'}), passport.authenticate('local', {
    // successRedirect: '/user/profile',
    successReturnToOrRedirect: '/',
    failureRedirect: '/auth/login',
    failureFlash: true
}));

router.get('/register',connectEnsure.ensureLoggedOut({redirectTo:'/'}), async(req, res, next) =>{
    //testing purpose. how to create flash message
    // req.flash('error', 'some error');
    // req.flash('info', 'hello');
    // const messages = req.flash()
    // console.log(messages);
    // res.render('register', {messages});
    res.render('register');
})

router.post('/register',connectEnsure.ensureLoggedOut({redirectTo:'/'}), [
    body('email').trim().isEmail().withMessage('Email is not valid').normalizeEmail().toLowerCase(),
    body('password').trim().isLength(6).withMessage('Password too short, min 6 character required'),
    // checking if both passwords are same
    body('password2').custom((value, {req}) =>{
        if(value !== req.body.password){
            throw new Error('password doesnot match')
        }
        return true;
    })
],
async(req, res, next) =>{
    // res.send('register post')
    try {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            errors.array().forEach((error) => {
                req.flash('error', error.msg);
            });
            res.render('register', {email: req.body.email ,messages: req.flash()});
            return;
        }
        const { email } = req.body;
        const doesExist = await User.findOne({email});
        if(doesExist){
            res.redirect('/auth/register')
            return;
        }
        const user =  new User(req.body);
        await user.save();
        //once the user is created successfully redirect to login page and display flash message
        req.flash('success', `${user.email} registered successfully now you can log in`)
        res.redirect('/auth/login');
        // res.send(user);
    } catch (error) {
        next(error)
    }
})
router.get('/logout',connectEnsure.ensureLoggedIn({redirectTo:'/'}), async(req,res,next)=>{
    // res.send('logout')
    //coming from paasport, method attach to req
    req.logOut();
    res.redirect('/');
})
module.exports = router;

//middleware to protect the route
// function ensureAuthenticated(req,res,next){
//     if(req.isAuthenticated()){
//         next()
//     }else{
//         res.redirect('/auth/login')
//     }
// }
// function ensureNOTAuthenticated(req,res,next){
//     if(req.isAuthenticated()){
//         res.redirect('back')
//     }else{
//        next();
//     }
// }
//use it before user route to make it protected