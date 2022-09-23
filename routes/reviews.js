const express  = require('express');

// Preserve the req.params values from the parent router.
const router = express.Router({mergeParams: true});

const catchAsync = require('../utils/catchAsync')
const {validateReview, isLoggedIn, isReviewAuthor} = require('../middleware')
const reviewsController = require('../controllers/reviewsController')


/**
 * Creat a review to a campground
 * Endpoint : /campgrounds/id/reviews/ ===> POST
 */
router.post('/', isLoggedIn, validateReview, catchAsync(reviewsController.createReview));

/**
 * Delete a review
 * Endpoint : /campgrounds/id/reviews/reviewId ===> DELETE
 */
router.delete('/:reviewId', isLoggedIn,isReviewAuthor, catchAsync(reviewsController.deleteReview));

// export module
module.exports = router;