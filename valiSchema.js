// data validator for JavaScript
const oriJoi = require('joi')

// Clear html tag
const sanitizeHtml = require('sanitize-html')

//this extension constrain input can not contain ant html tag
const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },

    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    // no tags allowed
                    allowedTags: [],
                    allowedAttributes: {},
                });

                if(clean !== value) return helpers.error('string.escapeHTML', {value})
                return clean;

            }
        }
    }
});

const Joi = oriJoi.extend(extension)

/**
 * Validate campground
 */
module.exports.campgroundValSchema = Joi.object({
    campground: Joi.object({
        title: Joi.string().required().escapeHTML(),
        price: Joi.number().required().min(0),
        location: Joi.string().required().escapeHTML(),
        description: Joi.string().required().escapeHTML()
    }).required(),
    deleteImages: Joi.array()
});

/**
 * Validate review
 */
module.exports.reviewValSchema = Joi.object({
    review: Joi.object({
        raiting: Joi.number().required().min(1).max(5),
        body: Joi.string().required().escapeHTML()
    }).required()
})

