const express = require("express")
const app = express();
const router = express.Router({mergeParams : true});
const wrapAsync = require("../utils/WrapAsync.js");
const { listingSchema , reviewSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
const listing = require("../models/listings.js");
const {isloggedin, isOwner} = require("../middleware.js");
const methodOverride = require("method-override");
const { storage } = require("../cloudconfig.js");
const multer  = require('multer')
const upload = multer({storage});

let mapaccesstoken = process.env.map_token 
const mbxgeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocodingClient = mbxgeocoding({ accessToken: mapaccesstoken });


app.use(methodOverride("_method"));

const validatelisting = (req , res , next) => {
    let { error } = listingSchema.validate(req.body);
    if(error){
        throw new ExpressError(400 , error)
    }else  {
        next();
    }
};

//INDEX ROUTE
router.get("/" ,wrapAsync(async (req,res) => {
    const alllisting =await listing.find({});
    res.render("listings/index.ejs", {alllisting});
 }))
 
 //new listing
 router.get("/new" ,isloggedin, (req,res) => {
     res.render("listings/new.ejs");
 });
 
 //SHOW
 router.get("/:id" ,wrapAsync(async (req,res) => {
    let {id} = req.params ;
    const idlist =await listing.findById(id).populate({
        path : "review" ,
        populate : {
            path : "author"
            
        },
    }).populate("owner"); 
    if(!idlist){
        req.flash("error" , "listing you requested for does not exits");
        res.redirect("/listings");
    }
    res.render("listings/show.ejs",{idlist} );
    // console.log(idlist);
     
 }));
 
 //create route
 router.post("/"  ,upload.single('listing[image]'), wrapAsync(async(req,res,next) => {
    let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location ,
        limit: 2
      })
        .send()
    let url = req.file.path;
    let filename = req.file.filename;
    const newlisting = await new listing(req.body.listing);
    newlisting.owner = req.user._id;
    newlisting.image = { url , filename};
    newlisting.geometry = response.body.features[0].geometry; 
    let savedlisting =  await newlisting.save();
    console.log(savedlisting);
    req.flash("success" , "new listing is created");
    res.redirect("/listings");
    
 
 }));
 
 //edit route
 router.get("/:id/edit" ,isloggedin,isOwner, wrapAsync(async(req,res) => {

     let { id } =req.params ;
     const listings = await listing.findById(id);
    //  let originalurl = listings.image.url;

     req.flash("success" , " listing is edited");
     res.render("listings/edit.ejs" ,{listings});
 }))
 
 
 //UPDATE ROUTE
 router.put("/:id" ,isOwner,upload.single('listing[image]') , wrapAsync(async(req,res) =>{
    let { id } = req.params;
    console.log(req.file);
    
    const update = await listing.findByIdAndUpdate(id , {...req.body.listing});
       if(typeof req.file !== "undefined"){
       let url = req.file.path;
       let filename = req.file.filename;
       update.image = {url , filename};
       await update.save();
    }
    req.flash("success" , " listing is updated"); 
    res.redirect(`/listings/${id}`);
    
 }));
 
 
 //DELETE ROUTE
 router.delete("/:id" ,isloggedin,isOwner, wrapAsync(async(req,res) =>{
     let { id } = req.params;
     let deleted_hotel = await listing.findByIdAndDelete(id);
     req.flash("success" , " listing is deleted");
     res.redirect("/listings");
     // console.log(deleted_hotel);
     
 }));

module.exports = router ;
 