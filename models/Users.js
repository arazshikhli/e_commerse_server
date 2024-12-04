const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const {cartItemSchema,wishListSchema} =require('./Products');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  picture:{type:String,default:''},
  isGoogleUser:{type:Boolean,default:false},
  isAdmin:{type:Boolean,default:false},
  cart: [cartItemSchema],
  wishList:[wishListSchema]
});


const User = mongoose.model('User', userSchema);
module.exports = User;
