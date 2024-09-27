const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});


const tvSchema = new mongoose.Schema({
  screenSize: { type: String, required: true },
  resolution: { type: String, required: true },
  smartTV: { type: Boolean, default: false },
});

const mobileSchema = new mongoose.Schema({
  screenSize: { type: String, required: true },
  battery: { type: String, required: true },
  camera: { type: String, required: true },
});

const laptopSchema = new mongoose.Schema({
  screenSize: { type: String, required: true },
  ram: { type: String, required: true },
  processor: { type: String, required: true },
  storage: { type: String, required: true },
});


const productSchema = new mongoose.Schema({
  model:{ type: String, required: true },
  brand: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String },
  stock: { type: Number, default: 0 },
  views: { type: Number, default: 0 }, 
  purchases: { type: Number, default: 0 }, 
  rating: {
    average: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
    ratingsSum: { type: Number, default: 0 }, 
  },
  comments: [commentSchema], 
  productDetails:{
    type:mongoose.Schema.Types.Mixed,
    required:true
  }
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
