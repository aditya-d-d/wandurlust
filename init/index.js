const mongoose = require("mongoose");
const initdata = require("./data.js");
const listing = require("../models/listings.js");


async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/wonderlust');
};
main().then(() => {
    console.log("connected to db");    
}) 
.catch((err) => {
    console.log(err);
    
});

const initDB = async() => {
    await listing.deleteMany({});
    initdata.data = initdata.data.map((obj) => ({
        ...obj ,
         owner :"67932213d22f28e4a9190c64" }))
    await listing.insertMany(initdata.data);
    console.log("data was intialized");    
};

initDB();