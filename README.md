# GoCamp

## Intro

- GoCamp is a full stack web app allows user to share campground, include position and pictures. User can creat, edit and delete their campground, and can leave reviews to campgrounds.
- GoCamp is developed based on Nodejs, backend uses Express as server and use Mongoose and MongoDB as ORM and database. Use Ejs as template engine.
- GoCamp project follows MVC  architecture and RESTful API.
- Complete authentication and authorization mechanisms, users cannot operate campground and comments created by others. Administrator can operate all campgrounds and reviews.
- The location information entered by user can be parsed as longitude and latitude and displayed on cluster map. User can click marker on map to campground details page.
- Client side validation and server side validation are implemented to prevent invalid data and unauthorized operation.
- Imported some security related packages to prevent database injection, cross-site scripting and other security problems.
- Deploy on heroku. Address: [https://fast-tundra-69241.herokuapp.com/](https://fast-tundra-69241.herokuapp.com/)
    
    (username: admin, password: admin   Have all permissions)
    

**Homepage**

![Untitled](GoCamp%209d8f0a5fba894a44a7d3889455a7cc39/Untitled.png)

**Index**

![Untitled](GoCamp%209d8f0a5fba894a44a7d3889455a7cc39/Untitled%201.png)

**Campround details**

![Untitled](GoCamp%209d8f0a5fba894a44a7d3889455a7cc39/Untitled%202.png)

**Login & Register**

![Untitled](GoCamp%209d8f0a5fba894a44a7d3889455a7cc39/Untitled%203.png)

![Untitled](GoCamp%209d8f0a5fba894a44a7d3889455a7cc39/Untitled%204.png)

**Creat/Edit Campground**

![Untitled](GoCamp%209d8f0a5fba894a44a7d3889455a7cc39/Untitled%205.png)

![Untitled](GoCamp%209d8f0a5fba894a44a7d3889455a7cc39/Untitled%206.png)

# Project Details

## Tech Stack

- [**Nodejs**](https://nodejs.org/en/)
- [**Express**](https://expressjs.com/)
- [**MongoDB**](https://www.mongodb.com/)
- [**Mongoose**](https://mongoosejs.com/)
- [**Ejs**](https://ejs.co/)
- [**ES6**](https://www.w3schools.com/js/js_es6.asp)
- [**Cloudinary**](https://cloudinary.com/documentation/node_integration)
- [**Mapbox**](https://docs.mapbox.com/mapbox-gl-js/api/)
- [**Heroku**](https://www.heroku.com/)

## Directory Structure

```
├─app.js                             // application main entrance
├─middleware.js                      // middlewares
├─valiSchema.js                      // mongodb modules validation
├─views                              // static resources
|   ├─error.ejs                      // 404 page
|   ├─home.ejs                       // home page
|   ├─users                          // user related pages
|   |   ├─login.ejs                  // login page
|   |   └register.ejs                // register page
|   ├─partials                       // bootstrap components
|   |    ├─flash.ejs                 // flash component
|   |    ├─footer.ejs                // footer
|   |    └navbar.ejs                 // navbar
|   ├─layouts                        // page layout
|   |    └boilerplate.ejs            // a boilerplate contains navbar and footer
|   ├─campgrounds                    // campgrounds related pages
|   |      ├─edit.ejs                // edit campground page
|   |      ├─index.ejs               // show all campgrounds page
|   |      ├─new.ejs                 // creat campground page
|   |      └show.ejs                 // campground details page
├─utils                              // utility functions
|   ├─catchAsync.js                  // handle async exception
|   └ExpressError.js                 // custom error (extend Error) 
├─seeds                              // initialize database files
|   ├─cities.js                      // cities information
|   ├─index.js                       // Initializing the database
|   └seedHelpers.js                  // some location keywords
├─routes                             // handling API
|   ├─campgrounds.js                 // campgrounds related api
|   ├─reviews.js                     // reviews related api
|   └users.js                        // users related api
├─public                             // public resources
|   ├─stylesheets                    // stylesheets
|   |      ├─error.css               // error page css
|   |      ├─home.css                // home page css
|   |      └stars.css                // review stars css
|   ├─js                             // javascript
|   | ├─clusterMap.js                // index page cluster page
|   | ├─showPageMap.js               // campground details page map
|   | └validateForm.js               // prevent submit empty form 
├─models                             // models
|   ├─campground.js                  // campground model
|   ├─review.js                      // review model
|   └user.js                         // user model
├─controllers                        // controllers
|      ├─campgroundsController.js    // campground related function
|      ├─reviewsController.js        // review related function
|      └usersController.js           // user related function
├─cloudinary                         // cloudinary related files
|     └index.js                      // cloudinary config
```

## Models

### Campground model

```jsx
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
```

### Review Model

```jsx
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
```

### User Model

```jsx
/**
 * UserSchema
 */
const UserSchema = new Schema({
    email:{
        type: String,
        required: true,
        unique: true
    }
});

/**
 * passportLocalMongoos will automatically add username and password to user schema
 */
UserSchema.plugin(passportLocalMongoos);

module.exports = mongoose.model('User', UserSchema);
```

## APIs

### Campground

```

**/campgrounds ===> GET**  Get all campgrounds and display on index page

**/campgrounds ===> POST** Creat new campground and save it to database

**/campground/new ===> GET** Route to creat new campground page

**/campground/id ===> GET**  Show campground details

**/campgrounds/id ===> PUT (POST fake as PUT)**  Edit campground

**/campgrounds/id ===> DELETE (POST fake as DELETE)**  Delete campground

**/campgrounds/id/edit ===> GET** Route to edit page
```

### Users

```
**/register ===> GET** Route to register page

**/register ===> POST** Register new user

**/login ===> GET** Route to login page

**/login ===> POST** User login
```

### Reviews

```
**/campgrounds/id/reviews/ ===> POST** Creat a review to a campground

**/campgrounds/id/reviews/reviewId ===> DELETE** Delete a review
```

## Async Error

For sync error, express will automatically handle it and pass it to error handling function(the function has four parameter). But express will not handle async error, and if we want handle error with `async/await` keywords, we need use `try/catch` to catch error and pass it to `next()` function.

In GoCamp project we encapsulate an `asyncCatch()` function to catch async error and pass it to `next()` function. In this project, we define three functions to deal with error.

1. **ExpressError**

```jsx
class ExpressError extends Error{
    constructor(message, statusCode){
        // Cause we extend Error class
        super();
        this.message = message;
        this.statusCode = statusCode;
    }
}

module.exports=ExpressError;
```

First we define a custom error called ExpressError extend Error, we set the message and statusCode.

This custom error main used to validation error.

1. **catchAsync function**

```
/**
 * Function use to handle async error
 * Associate async/await with Express error handling middleware
 */
module.exports = func => {
    return (req, res, next) => {
        // Catch async func error and pass it to next()
        // if func(req, res, next) is async function, it return a promise object
        // then call promise.catch() method to catch error and pass to next() function
        func(req, res, next).catch(next);
    }
}
```

1. **Error handling function**

```jsx
/**
 * Error handling function
 * DEFAULT statusCode = 500, message = 'Something went wrong'
 */
app.use((err, req, res, next) => {
    const {statusCode = 500} = err;
    if(!err.message) err.message = 'Oh No, Something Went Wrong!';
    res.status(statusCode).render('error', {err})
})
```

All errors will finally pass to this function to handle, we set a default status code and message.

## Authentication and Authorization

I defined middleware to implement Authentication and Authorization. User can not operate campgroud or review which is not created by them.

```jsx
**
 * isAuthenticated() is passport package method
 * to check whether user is login
 */
module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()){
        req.flash('error', 'You must be signed in!');
        return res.redirect('/login');
    }
    next();
}

/**
 * validate campground author and current user
 */
module.exports.isAuthor = async (req, res, next) => {
    const {id} = req.params;
    const campground = await Campground.findById(id);
    if(!campground.author.equals(req.user._id) && req.user._id != process.env.ADMIN_ID){
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

/**
 * validate review author and current user
 */
module.exports.isReviewAuthor = async (req, res, next) => {
    const {id, reviewId} = req.params;
    const review = await Review.findById(reviewId);
    if(!review.author.equals(req.user._id) && req.user._id != process.env.ADMIN_ID){
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}
```
