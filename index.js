if(process.env.NODE_ENV != "production"){
    require('dotenv').config()

}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const { error } = require("console");
const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const cookieParser = require('cookie-parser');
const flash = require("connect-flash");
const passport = require("passport");
const localstrategy = require("passport-local");
const user = require("./models/user.js");
const UserRouter = require("./routes/user.js");
const { saveRedirectUrl } = require("./middleware.js");


// console.log(process.env.secret)

app.use(express.json());
app.set("view engine", "ejs");
app.set("views" , path.join(__dirname,"views"));
app.use(express.urlencoded({extended : true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname,"/public")));
app.use(flash());

const atlas_url = process.env.ATLASDB_URL;

main().then(() => {
    console.log("connected to db");
})
.catch((err) => {
    console.log(err);
    
})
async function main(){
    await mongoose.connect(atlas_url);    
}
const store = MongoStore.create({
    mongoUrl :atlas_url,
    crypto : {
        secret : "mysecretstring"
    }
     ,
    touchAfter : 24 * 3600
})


const sessionoptions = {
    store,
    secret : "mysecretstring" ,
    resave : false,
    saveUninitialized : true,
    cookie : {
        expires : Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge : 7 * 24 * 60 * 60 * 1000,
        httpOnly : true
    }

};
app.use(session(sessionoptions));
app.use(passport.initialize()); 
app.use(passport.session()); 
passport.use(new localstrategy(user.authenticate()));

passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

app.use((req,res ,next) =>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.curuser = req.user;
    next();
})



app.use("/listings" , listings);
app.use("/listings/:id/reviews" , reviews);

//login
app.get("/login" , (req,res) => {
    res.render("users/login.ejs")
});

app.post("/login" , saveRedirectUrl ,
    passport.authenticate('local' ,
        { failureRedirect : '/login' ,
        failureFlash : true}), 

        async(req,res) =>{
        req.flash("success" , "successfully loged-in");
        let redirectUrl = res.locals.redirectUrl || "/listings";
        res.redirect(redirectUrl);
    } 
);

//signup
app.get("/signup" ,(req,res) => {
    res.render("users/signup.ejs")
})
app.post("/signup" ,async(req , res) => {
    try{
        let {username , email ,password} = req.body;
        let newuser =  new user({email,username});
        const registereduser =  await user.register(newuser , password);
        // console.log(registereduser);
        req.logIn(registereduser , (err) => {
            if(err){
                return next(err);
            }
            req.flash("success" , "welcome to wandurlust");
            res.redirect("/listings");
        })
        
    }catch(e){
        req.flash("error" , e.message);
        res.redirect("/listings");
    }
})

//logout

app.get("/logout" , (req,res,next) => {
    req.logOut((err) => {
        if(err) {
            return next(err);
        }
        req.flash("success" , "successfully logged out");
        res.redirect("/listings");
    })

})

// const mongo_url =  ;


app.all("*", (req,res,next) => {
    next(new ExpressError(404 , "Page Not Found"));
})

app.use((err,req,res,next) => {
    let {statusCode = 500 , message = "something went wrong"} = err;
    res.status(statusCode).render("error.ejs" , {message})
    // res.status(statusCode).send(message);
})


app.get("/",(req,res) =>{
   res.send("hi , i am root")
})

app.listen(8080 ,() => {
    console.log("server is listening");
});