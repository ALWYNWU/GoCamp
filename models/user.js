const mongoose = require('mongoose');
const passportLocalMongoos = require('passport-local-mongoose');
const Schema = mongoose.Schema;

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



