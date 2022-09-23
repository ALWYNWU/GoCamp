const Campground = require('../models/campground');
const {cloudinary} = require('../cloudinary');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken: mapBoxToken});

/**
 * Find all campgrounds and display on index page
 */
module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}

/**
 * Route to creat campground page 
 */
module.exports.toNewForm = (req, res) => {
    res.render('campgrounds/new');
}

/**
 * Creat new campground
 */
module.exports.creatCampground = async (req, res) => {
    
    // Use mapbox api parse location information
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()

    // If the location can not be parsed, flash error
    // Redirect to creat campground page
    if (!geoData.body.features[0]) {
        req.flash('error', 'Cannot find the location');
        return res.redirect('/campgrounds/new');
    }

    // After parsed location information, creat new campground model
    const campground = new Campground(req.body.campground);

    // Store geo information to campground
    campground.geometry = geoData.body.features[0].geometry;
    // Store images info
    campground.images = req.files.map(f => ({url: f.path, filename: f.filename}));
    // Store author id
    campground.author = req.user._id;

    await campground.save();

    req.flash('success', 'Successfully made a new campground!');

    res.redirect(`/campgrounds/${campground._id}`);
}

/**
 * Show campgrounds details 
 */
module.exports.showCampground = async (req, res) => {
    
    /**
     * populate can show details of sub schema
     * campgropud{
     *      review{
     *          body: ....,
     *          author: {
     *              username: ...,
     *              Id: ....
     *          }
     *      }
     *      author: {
     *          username:...,
     *          id: ....
     *      }
     * }
     */
    const campground = await Campground.findById(req.params.id)
        .populate({path: 'reviews', populate: {path: 'author'}})
        .populate('author');

    // server side validation
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }

    res.render('campgrounds/show', {campground});
}

/**
 * Redirect to edit page 
 */
module.exports.toEditForm = async (req, res) => {

    const campground = await Campground.findById(req.params.id)

    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }

    res.render('campgrounds/edit', {campground})
}

/**
 * Edit campground
 */
module.exports.updateCampground = async (req, res) => {
    
    const camp = await Campground.findById(req.params.id);

    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()

    if (!geoData.body.features[0]) {
        req.flash('error', 'Cannot find the location');
        return res.redirect(`/campgrounds/${camp._id}/edit`);
    }

    // ...req.body.campground presents update the whole campground object
    const campground = await Campground.findByIdAndUpdate(req.params.id, {...req.body.campground});
    
    campground.geometry = geoData.body.features[0].geometry;

    const imgs = req.files.map(f => ({url: f.path, filename: f.filename}));

    // ...imgs means update the whole array
    campground.images.push(...imgs);

    await campground.save();

    // if user want delete some images of campground, deleteImage is an array
    if(req.body.deleteImages){

        // delete image form cloudinary
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename);
        }

        // if deleteImages array is not empty, delete the item matched by filename, pull means delete
        await campground.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages}}}});
    }

    req.flash('success', 'Successfully update a campground!');

    res.redirect(`/campgrounds/${campground._id}`);
}

/**
 * Delete campground
 */
module.exports.deleteCampground = async (req, res) => {
    const {id} = req.params;

    // Override in campground model, also delete campground's reviews
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully delete a campground!');
    res.redirect('/campgrounds')
}