const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin:{type:String,default:false},
  cart: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'cart.productType' 
      },
      productType: {
        type: String,
        required: true,
        enum: ['Mobile', 'Laptop', 'TV'] 
      },
      quantity: { type: Number, default: 1 }
    }
  ]
});


userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;
