const Campground = require('../models/campground');
const {cloudinary} = require('../cloudinary');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;

const geocoder = mbxGeocoding({accessToken: mapBoxToken});

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}

module.exports.toNewForm = (req, res) => {
    res.render('campgrounds/new');
}

module.exports.creatCampground = async (req, res) => {
    
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()

    if (!geoData.body.features[0]) {
        req.flash('error', 'Cannot find the location');
        return res.redirect('/campgrounds/new');
    }



    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;

    campground.images = req.files.map(f => ({url: f.path, filename: f.filename}));

    campground.author = req.user._id;
    await campground.save();

    console.log(campground);

    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.showCampground = async (req, res) => {
    // populate 能够显示出review和author的详细信息
    const campground = await Campground.findById(req.params.id)
        .populate({path: 'reviews', populate: {path: 'author'}})
        .populate('author');
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', {campground});
}

module.exports.toEditForm = async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', {campground})
}

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

    const campground = await Campground.findByIdAndUpdate(req.params.id, {...req.body.campground});
    

  


    campground.geometry = geoData.body.features[0].geometry;

    const imgs = req.files.map(f => ({url: f.path, filename: f.filename}));
    // imgs是array ...imgs是将数组中的元素push到数组中
    campground.images.push(...imgs);
    await campground.save();

    if(req.body.deleteImages){

        // 从云端删除文件
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename);
        }

        //  前端传回来的deleteImages数组 如果不为空 删除其中filename匹配的项 pull是删除
        await campground.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages}}}});
    }

    req.flash('success', 'Successfully update a campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteCampground = async (req, res) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully delete a campground!');
    res.redirect('/campgrounds')
}