const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');


//using it as a middleware
passport.use(
    new LocalStrategy(
        {
            usernameField: 'email',
            passwordField: 'password'
        },
        async(email, password, done) =>{
            try {
                const user = await User.findOne({email});
                //if user doesn't exist
                if(!user){
                    return done(null, false, {message: "Email isn't registered"})
                }
                //email exist now checking for valid password, you can either use bcrypt or create a function inside user model.
                const isMatch = await user.isValidPassword(password);
                return isMatch ?  done(null, user) : done(null, false, {message: 'Email or Password incorrect'})
            } catch (error) {
                done(error)
            }
        }
    )
)
passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});