const cloudinary = require('cloudinary').v2;
const dotenv=require('dotenv')
dotenv.config()
cloudinary.config({
  cloud_name: 'dncqecspn',
  api_key: '335555135712566',
  api_secret: 'v-R7jdTI_7jwM2Rtw9y4gxAkKWc',
});

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

module.exports = cloudinary;