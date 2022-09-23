require('dotenv').config();

const express  = require('express');
const path = require('path');
const mongoose = require('mongoose');

// methodOverride used to fake POST request to PUT and DELETE
const methodOverride = require('method-override');

// partial and block template functions for the EJS template engine
const ejsMate = require('ejs-mate');

const ExpressError = require('./utils/ExpressError')

// a special area of the session used for storing messages
// the message is available to the next page that is to be rendered.
const flash = require('connect-flash');

// User password related package
// Automatically encrypt password
const passport = require('passport');
const localStrategy = require('passport-local');

const User = require('./models/user');

 // Security related package
const helmet = require('helmet')
// Prevent mongo injection
const mongoSanitize = require('express-mongo-sanitize')

const session = require('express-session')

const userRoutes = require('./routes/users')
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');

// Used to store session
const MongoDBStore = require('connect-mongo');

// Connect database
const dbUrl =process.env.DB_URL;
mongoose.connect(dbUrl,{
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
    console.log("Database connected");
});

/**
 * Use express server
 */
const app = express();

/**
 * Set ejs as html template
 * Set views directory path
 */
app.engine('ejs',ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


/**
 * Let express middleware parse url
 */
app.use(express.urlencoded({extended: true}))

/**
 * Cause browser can only parse GET and POST
 * Use this model to fake PUT and DELETE request (Essentially still POST)
 */
app.use(methodOverride('_method'));

// prevent mongo injection
app.use(mongoSanitize());

// security package
app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false
    })
);

// set static resources path
app.use(express.static(path.join(__dirname, 'public')))

// Store session
const store = MongoDBStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto :{
        secret: 'SECRET'
    }
    
});

store.on('error', function (e){
    console.log("SESSION STORE ERROR", e)
})

const sessionConfig = {
    store,
    name:'sss',
    secret: 'SECRET',
    resave: false,
    saveUninitialized: true,
    cookie: {
        // js can not access session
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

// session needs before passport.session()
app.use(session(sessionConfig))
app.use(flash());

app.use(passport.initialize());
// user information will be contained in session
app.use(passport.session());
// authenticate() generates a function that is used in passport's localStrategy
passport.use(new localStrategy(User.authenticate()));

// serialize and deserialize (how to store and unstore user in session)
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// this middleware will handle all request and response
app.use((req, res, next) => {

    /**
     * If the url before login contains originalUrl
     * Reserve this url to req.session.returnTo and this will be 
     * used to redirect to the page before login
     */
    if(!['/login','/'].includes(req.originalUrl)){
        req.session.returnTo = req.originalUrl;
    }

    // Passport is going to take the user deserialize from the session and 
    // store it into the Request with just the ID username and the email
    // then front end can access user info through currentUser
    // Ex: if currentUser doesn't exist, do not show edit and delete button
    res.locals.currentUser = req.user;

    // pass flash message information to front end
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');

    next();
})

/**
 * express routes
 */
app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);

/**
 * HomePage
 */
app.get('/', (req, res) => {
    res.render('home');
});

/**
 * 404 error
 */
app.all('*', (req, res, next) => {

    // This error will pass to error handling function
    next(new ExpressError('Page Not Found', 404))
})

/**
 * Error handling function
 * DEFAULT statusCode = 500, message = 'Something went wrong'
 */
app.use((err, req, res, next) => {
    const {statusCode = 500} = err;
    if(!err.message) err.message = 'Oh No, Something Went Wrong!';
    res.status(statusCode).render('error', {err})
})

/**
 * Open server on 3000 port
 */
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Serving on port ${port}!`)
})