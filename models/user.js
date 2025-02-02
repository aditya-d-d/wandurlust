const { string, required } = require('joi');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const Userschema = new Schema({
    email : {
        type : String,
        required  : true
    }
});

Userschema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', Userschema);