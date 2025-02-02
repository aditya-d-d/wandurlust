const listing = require("./models/listings.js");

module.exports.isloggedin = (req,res , next) => {
    if(!req.isAuthenticated()) {
        // console.log(req.originalUrl);
        req.session.redirecturl = req.originalUrl;
        console.log(req.session.redirecturl);
        req.flash("error" , "You must be loggedin ");
        return  res.redirect("/login");
    }
    next();
}

module.exports.saveRedirectUrl = (req,res,next) => {
    if(req.session.redirecturl){
        res.locals.redirectUrl = req.session.redirecturl;
        console.log(res.locals.redirectUrl);
        
    };
    next();
}

module.exports.isOwner = async (req,res,next) => {
    let { id } = req.params;
    let listings = await listing.findById(id);
    console.log(listings);
    if(!listings.owner._id.equals(res.locals.curuser._id)){
       req.flash("error" , "you are not allowed");
       return res.redirect(`/listings/${id}`);
    }
    next();
}