const mongoose = require('mongoose');
const passportLocalMongoos = require('passport-local-mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    email:{
        type: String,
        required: true,
        unique: true
    }
});

// Add password and username to user schema
UserSchema.plugin(passportLocalMongoos);

module.exports = mongoose.model('User', UserSchema);



