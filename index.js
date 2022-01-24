const express = require('express');
const createHttpError = require('http-errors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const expressSession = require('express-session');
const connectFlash = require('connect-flash');
const passport  = require('passport');
const MongoStore = require('connect-mongo');
const connectEnsureLogin = require('connect-ensure-login');
require('dotenv').config();
const indexRoute = require('./routes/index');
const authRoute = require('./routes/auth');
const userRoute = require('./routes/user');
const adminRoute = require('./routes/admin');
const { roles } = require('./utils/constants');
const PORT = process.env.PORT || 5000;
const app = express();
app.use(morgan('dev'));
//setting the view engine
app.set('view engine', 'ejs')
app.use(express.static(__dirname + '/public'));
app.use(express.json());
app.use(express.urlencoded({extended: false}))
//initializing session
app.use(expressSession({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie:{
        // secure: true 'only use for production when using https server'
        httpOnly: true
    },
    store: MongoStore.create({
        mongoUrl: process.env.DB_URI
    })
}))
//using passport JS authentication
app.use(passport.initialize());
app.use(passport.session());
require('./utils/paasport.auth');
//after authentication using passport
app.use((req,res,next) =>{
    res.locals.user = req.user;
    next();
})
app.use(connectFlash());
app.use((req, res, next) =>{
    res.locals.messages = req.flash();
    next();
})
// app.get('/', (req,res) =>{
//     res.send('HELLO')
// })
app.use('/', indexRoute)
app.use('/auth', authRoute)
// app.use('/user',ensureAuthenticated,userRoute)
app.use('/user',connectEnsureLogin.ensureLoggedIn({redirectTo:'/auth/login'}),userRoute)
app.use('/admin',connectEnsureLogin.ensureLoggedIn({redirectTo:'/auth/login'}),ensureAdmin, adminRoute)
//404 handeler
app.use((req, res, next) =>{
    next((createHttpError.NotFound()))
})
app.use((error, req, res, next) =>{
    error.status = error.status || 500
    res.status(error.status);
    res.render('error_404', {error})
    // res.send(error)
})
mongoose.connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('💾 connected');
    app.listen(PORT, console.log(`🚀 on port ${PORT}`))
})
    .catch(err => console.log(err))

// function ensureAuthenticated(req, res, next) {
//     if (req.isAuthenticated()) {
//         next()
//     } else {
//         res.redirect('/auth/login')
//     }
// }
function ensureAdmin(req, res, next){
    if(req.user.role === roles.admin){
        next()
    }else{
        req.flash('warning', 'you are not authorized to view this page');
        res.redirect('/');
    }
}
function ensureModerator(req, res, next){
    if(req.user.role === roles.moderator){
        next()
    }else{
        req.flash('warning', 'you are not authorized to view this page');
        res.redirect('/');
    }
}