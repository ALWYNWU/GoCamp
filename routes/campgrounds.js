const express  = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const{storage} = require('../cloudinary');

/**
 * Multer is a node.js middleware for handling multipart/form-data, 
 * which is primarily used for uploading files.
 */
const multer = require('multer');
const upload = multer({storage});

const campgroundsController = require('../controllers/campgroundsController');

// Import middleware
const {isLoggedIn, validateCampground, isAuthor} = require('../middleware');


router.route('/')

    /**
    * Get all campgrounds and display on index page
    * Endpoint: /campgrounds ===> GET
    */
    .get(catchAsync(campgroundsController.index))

    /**
     * Creat new campground and save it to database
     * isLoggedIn: must login to creat campground
     * Endpoint: /campgrounds ===> POST
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
     */
    .put(isLoggedIn, isAuthor,upload.array('image'), validateCampground, catchAsync(campgroundsController.updateCampground))

    /**
     * Delete campground
     * Endpoint: /campgrounds/id ===> DELETE (POST fake as DELETE)
     */
    .delete(isLoggedIn, isAuthor, catchAsync(campgroundsController.deleteCampground))


/**
 * Route to edit page
 * Endpoint: /campgrounds/id/edit ===> GET
 */
router.get('/:id/edit',isLoggedIn, isAuthor, catchAsync(campgroundsController.toEditForm));

// export
module.exports = router;