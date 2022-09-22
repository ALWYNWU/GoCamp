const mongoose = require('mongoose');
const cities = require('./cities')
const {places, descriptors} = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp',{
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
    console.log("Database connected");
});

/*
    Random selected a element in an array
*/
const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 300; i++){
        const random_1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground ({
            author: '632966b8ac37c05d80831ce3',
            location: `${cities[random_1000].city}, ${cities[random_1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random_1000].longitude,
                    cities[random_1000].latitude
                ]
            },
            images: [ 
                { 
                    url:'https://res.cloudinary.com/dzcnerid1/image/upload/v1663722132/YelpCamp/rve2lw2uvdmmianctlxk.jpg',
                    filename: 'YelpCamp/rve2lw2uvdmmianctlxk' },
                { 
                    url:'https://res.cloudinary.com/dzcnerid1/image/upload/v1663722132/YelpCamp/uooau95ckwhtgka0rdct.jpg',
                    filename: 'YelpCamp/uooau95ckwhtgka0rdct' 
                } 
            ],
            description: 'Close enough but far enough to get away from the city. Great place to take the kids to winter or summer camp, hike or kayak. The fire wood/fire pass setup is a great perk. Always enjoyed our time here and have not had a single bad experience.',
            price: price
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})