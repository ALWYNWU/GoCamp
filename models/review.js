const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * reviewSchema
 * @body: review text
 * @raiting: user rate
 * @author: reference user model
 */
const reviewSchema = new Schema({
    body: String,
    raiting: Number,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
})

module.exports = mongoose.model("Review", reviewSchema)
