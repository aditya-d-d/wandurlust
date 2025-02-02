const { ref, required } = require("joi");
const mongoose = require("mongoose");
const schema = mongoose.Schema;
const Review = require("./review.js")
const User = require('./user.js')

const listingSchema = new schema({
    title : {
        type : String ,
        required : true } ,
        description : {
        type : String ,
        required : true
    },
    image : {
        url: {
            type : String
        }
        
    } ,
    price : Number ,
    location : String,
    country : String ,
    review : [
        {
        type : schema.Types.ObjectId,
        ref : "Review"
        }
    ],
    owner : {
        type : schema.Types.ObjectId,
        ref : "User"
    },
    geometry : {
        type: {
          type: String, 
          enum: ['Point'], 
          required: true
        },
        coordinates: {
          type: [Number],
          required: true
        }
    }

});

listingSchema.post("findOneAndDelete" , async(listing) => {
    if(listing){
        await Review.deleteMany({_id : {$in : listing.review}})
    }
})

const listing = mongoose.model("listings",listingSchema);
module.exports = listing ;
