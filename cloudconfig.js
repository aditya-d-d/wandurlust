const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});
// console.log(cloud_name);

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        return {
            folder: "wandurlust_DEV",
            format: file.mimetype.split("/")[1], // Extract format dynamically
            public_id: `image-${Date.now()}`, // Unique filename
        };
    },
});


module.exports = {
    cloudinary, storage
};
