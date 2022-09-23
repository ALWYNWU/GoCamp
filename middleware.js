const {campgroundValSchema, reviewValSchema} = require('./valiSchema.js');
const ExpressError = require('./utils/ExpressError')
const Campground = require('./models/campground')
const Review = require('./models/review')
require('dotenv').config();

module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()){

        

        req.flash('error', 'You must be signed in!');
        return res.redirect('/login');
    }
    next();
}


module.exports.validateCampground = (req, res, next) => {
    const {error} = campgroundValSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else{
        // let next middleware execute after this middleware execution
        next();
    }
}

module.exports.isAuthor = async (req, res, next) => {
    const {id} = req.params;
    const campground = await Campground.findById(id);
    if(!campground.author.equals(req.user._id) && req.user._id != process.env.ADMIN_ID){
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

module.exports.isReviewAuthor = async (req, res, next) => {
    const {id, reviewId} = req.params;
    const review = await Review.findById(reviewId);
    if(!review.author.equals(req.user._id) && req.user._id != process.env.ADMIN_ID){
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

module.exports.validateReview = (req, res, next) => {
    const {error} = reviewValSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else{
        // let next middleware execute after this middleware execution
        next();
    }
}


module.exports.checkReturnTo = (req, res, next) => {
    if (req.session.returnTo){
        res.locals.returnTo = req.session.returnTo
    }
    next();
}