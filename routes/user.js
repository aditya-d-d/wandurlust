const express = require("express")
const router = express.Router();
const wrapAsync = require("../utils/WrapAsync.js");


// console.log("file is loading");

router.get("/signup",(req,res) => {
    // res.send('form');
    console.log("signup route");
    
    res.render("users/signup.ejs");
})

module.exports = router;