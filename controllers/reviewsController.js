const Campground = require('../models/campground');
const Review = require('../models/review')

/**
 * Creat reviews
 */
module.exports.createReview = async (req, res) => {

    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    
    // Must login to creat review
    review.author = req.user._id;

    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Created new review!');
    res.redirect(`/campgrounds/${campground._id}`);
}

/**
 * Delete reviews
 */
module.exports.deleteReview = async (req, res) => {

    // Get reviewId and campground Id
    const {id, reviewId} = req.params;
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully delete a review!');
    res.redirect(`/campgrounds/${id}`)
}