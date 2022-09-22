const express  = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync')
const Campground = require('../models/campground');
const Review = require('../models/review')

const{storage} = require('../cloudinary')
const multer = require('multer')
const upload = multer({storage})

const campgroundsController = require('../controllers/campgroundsController');
const {isLoggedIn, validateCampground, isAuthor} = require('../middleware');


router.route('/')

    /**
    * Get all campgrounds
    * Endpoint: /campgrounds ===> GET
    * Pass campgrounds to front-end
    */
    .get(catchAsync(campgroundsController.index))

    /**
     * Creat new campground and save it to database
     * Endpoint: /campgrounds ===> POST
     * Then redirect to campground details
     */
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgroundsController.creatCampground))



/**
 * Route to creat new campground page
 * Endpoint: /campground/new ===> GET
 * This api should before '/campgrounds/:id', cause it will parse 'new' as 'id'
 */
 router.get('/new', isLoggedIn, campgroundsController.toNewForm);


router.route('/:id')

    /**
     * Show campground details
     * Endpoint: /campground/id ===> GET
     */
    .get(catchAsync(campgroundsController.showCampground))

    /**
     * Edit campground, accept data from front-end, update data in database
     * Endpoint: /campgrounds/id ===> PUT (POST fake as PUT)
     * {...req.body.campground} represents pass an object
     */
    .put(isLoggedIn, isAuthor,upload.array('image'), validateCampground, catchAsync(campgroundsController.updateCampground))

    /**
     * Delete campground
     * Endpoint: /campgrounds/id ===> DELETE (POST fake as DELETE)
     */
    .delete(isLoggedIn, isAuthor, catchAsync(campgroundsController.deleteCampground))


/**
 * Route to  edit page
 * Endpoint: /campgrounds/id/edit ===> GET
 * Pass campground to front-end
 */
router.get('/:id/edit',isLoggedIn, isAuthor, catchAsync(campgroundsController.toEditForm));




module.exports = router;