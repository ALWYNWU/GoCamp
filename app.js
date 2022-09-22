// if(process.env.NODE_ENV !== 'production') {
//     require('dotenv').config();
// }
require('dotenv').config();



const express  = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const catchAsync = require('./utils/catchAsync')
const ExpressError = require('./utils/ExpressError')
const flash = require('connect-flash');
const passport = require('passport');
const localStrategy = require('passport-local');
const User = require('./models/user');

const helmet = require('helmet')

const mongoSanitize = require('express-mongo-sanitize')


const session = require('express-session')

const userRoutes = require('./routes/users')
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');

const MongoDBStore = require('connect-mongo');

const dbUrl =process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
// const dbUrl = 'mongodb://localhost:27017/yelp-camp'
/**
 * Connect Database (MongoDB, Mongoose)
 * mongodb://localhost:27017/yelp-camp
 */
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

// 防止mongo injection
app.use(mongoSanitize());

// security package
app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false
    })
);

app.use(express.static(path.join(__dirname, 'public')))

// 储存session
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

// session需要再passport.session()之前
app.use(session(sessionConfig))
app.use(flash());

app.use(passport.initialize());
// session中包含用户数据
app.use(passport.session());
// authenticate() generates a function that is used in passport's localStrategy
passport.use(new localStrategy(User.authenticate()));

// serialize and deserialize (how to store and unstore user in session)
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// middleware
app.use((req, res, next) => {

    if(!['/login','/'].includes(req.originalUrl)){
        req.session.returnTo = req.originalUrl;
    }

    // passport会将session中的user deserialize然后储存到request中 只包含 id username和email
    res.locals.currentUser = req.user;
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
 * 处理404 error
 */
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

/**
 * This function use to handle error
 * 用来处理别的error
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