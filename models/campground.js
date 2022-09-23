const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

/**
 * ImageSchema: Nest in CampgroundSchema
 * Store campground images
 * Creat it separately for it's onw function 
 */
const ImageSchema = new Schema({
    url: String,
    filename: String
});

/**
 * thumbnail function
 * Show thumbnails when edit campgrounds
 */
ImageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('/upload', '/upload/w_200');
})

/**
 * thumbnail is virtual
 * Set opts to keep virtuals when CampgroundSchema pass as JSON
 * Pass opts when creat CampgroundSchema
 */
const opts = { toJSON: { virtuals: true } };

/**
 * CampgroundSchema
 */
const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],

    /**
     * Information for Mapbox api 
     * Don't do `{ location: { type: String } }`
     * 'location.type' must be 'Point'
     * 'coordinates' : longtitude and latitude
     */
    geometry: {
        type: {
          type: String,
          enum: ['Point'],
          required: true
        },
        coordinates: {
          type: [Number],
          required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ],
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
}, opts);

/**
 * Override 'findOneAndDelete'
 * Delete campground's review when delete campground
 */
CampgroundSchema.post('findOneAndDelete', async function (doc) {
    if(doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

/**
 * When click on cluster maps
 * Popup links link to campground details page
 */
CampgroundSchema.virtual('properties.popUpMarkup').get(function() {
    return `<strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
            <p>${this.location}</p>`
})

module.exports = mongoose.model('Campground', CampgroundSchema);
