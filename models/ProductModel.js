const mongoose = require('mongoose');
const   {commentSchema}=require('./Products')

const productModelSchema = new mongoose.Schema({
  categoryName: { type: String, required: true }, 
  attributes: [{
   attributeName: { type: String, required: true }, 
    type: { type: String, required: true }  
  }],
  comments:[commentSchema],
  stock: { type: Number, default: 0 },
  views: { type: Number, default: 0 }, 
});

const ProductModel = mongoose.model('ProductModel', productModelSchema);

module.exports = ProductModel;