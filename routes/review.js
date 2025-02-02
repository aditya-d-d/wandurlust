const express = require("express");
const app = express();
const router = express.Router({ mergeParams : true});
const wrapAsync = require("../utils/WrapAsync.js");
const { reviewSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
const listing = require("../models/listings.js");
const review = require("../models/review.js");
const {isloggedin, isOwner} = require("../middleware.js");
// const listing = require("../models/listings.js");
const methodOverride = require("method-override");


app.use(methodOverride("_method"));

const validateReview = (req , res , next) => {
// const methodOverride = require("method-override");
    let { error } = reviewSchema.validate(req.body);
    if(error){
        throw new ExpressError(400 , error)
    }else  {
        next();
    }
}


//REVIEWS

router.get("/" , async (req ,res) => {
    let listings = await listing.findById(req.params.id);
    
    res.redirect(`/listings/${listings._id}`);
})
//post route
router.post("/" , isloggedin , validateReview ,wrapAsync (async(req,res) => {
    let listings = await listing.findById(req.params.id);
    let newreview = new review(req.body.review);
    newreview.author = req.user._id;
    console.log(newreview);
    
    req.flash("success" , "new review is created");
    listings.review.push(newreview);

    await listings.save();
    await newreview.save();

    console.log("new review saved");
    // res.send("New review Saved");

    res.redirect(`/listings/${listings._id}`);
    
}));

//DELETE REVIEWS

router.delete("/:reviewId",isloggedin,isOwner ,
    wrapAsync(async (req , res) => {
        let { id , reviewId} = req.params;
        req.flash("success" , " review is deleted");
        await listing.findByIdAndUpdate(id , {$pull : {review : reviewId}});
        await review.findByIdAndDelete(reviewId);
        res.redirect(`/listings/${id}`);
    })
);

module.exports = router ;