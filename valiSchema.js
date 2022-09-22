const oriJoi = require('joi')
const sanitizeHtml = require('sanitize-html')


const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },

    rules: {
        escapeHTML: {
            validate(value, helpers) {
                // clean 是sanitizeHtml清理完的
                const clean = sanitizeHtml(value, {
                    // 什么都不允许
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


module.exports.campgroundValSchema = Joi.object({
    campground: Joi.object({
        title: Joi.string().required().escapeHTML(),
        price: Joi.number().required().min(0),
        // image: Joi.string().required(),
        location: Joi.string().required().escapeHTML(),
        description: Joi.string().required().escapeHTML()
    }).required(),
    deleteImages: Joi.array()
});

module.exports.reviewValSchema = Joi.object({
    review: Joi.object({
        raiting: Joi.number().required().min(1).max(5),
        body: Joi.string().required().escapeHTML()
    }).required()
})

