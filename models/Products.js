const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      productType: { type: String, enum: ['Mobile', 'Laptop', 'TV'], required: true },
      productId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'items.productType' },
      quantity: { type: Number, default: 1 }
    }
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const cartItemSchema = new mongoose.Schema({
  productId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true, 
    refPath: 'productType' // Динамическая ссылка на модель в зависимости от типа продукта
  },
  productType: { 
    type: String, 
    required: true, 
    enum: ['Mobile', 'TV', 'Laptop'] // Перечисление возможных типов продуктов
  },
  quantity: { 
    type: Number, 
    required: true, 
    default: 1 
  },
});

// Add pre-save hook to update `updatedAt` on each save
cartSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const productSchema = new mongoose.Schema({
  model:{ type: String, required: true },
  brand: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: [String] },
  stock: { type: Number, default: 0 },
  views: { type: Number, default: 0 }, 
  comments: [commentSchema], 
  productDetails:{
    type:mongoose.Schema.Types.Mixed,
    required:true
  }
});
const tvSchema = new mongoose.Schema({
  model:{ type: String, required: true },
  brand: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  imageURL: { type:[ String ]},
  stock: { type: Number, default: 0 },
  views: { type: Number, default: 0 }, 
  screenSize: { type: String, required: true },
  resolution: { type: String, required: true },
  smartTV: { type: Boolean, default: false },
  categoryName:{type:String,default:'TV'},
  comments: {
    type: [commentSchema], // Определяем как массив схемы комментариев
    default: [] // Добавляем пустой массив по умолчанию
  },
});

const mobileSchema = new mongoose.Schema({
  model:{ type: String, required: true },
  brand: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  imageURL: { type: [String] },
  stock: { type: Number, default: 0 },
  views: { type: Number, default: 0 }, 
  screenSize: { type: String, required: true },
  ram: { type: String, required: true },
  processor: { type: String, required: true },
  storage: { type: String, required: true },
  battery:{type:String,required:true},
  operatingSystem:{type:String,required:true},

  displayType:{type:String,required:true},
  batteryCapacity:{type:String,required:true},
  weight:{type:String,required:true},
  network:{type:String,required:true},

  categoryName:{type:String,default:'Mobile'},
  comments: {
    type: [commentSchema], // Определяем как массив схемы комментариев
    default: [] // Добавляем пустой массив по умолчанию
  },
});

const laptopSchema = new mongoose.Schema({
  model:{ type: String, required: true },
  brand: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  imageURL: { type: [String] },
  stock: { type: Number, default: 0 },
  views: { type: Number, default: 0 }, 
  screenSize: { type: String, required: true },
  ram: { type: String, required: true },
  processor: { type: String, required: true },
  storage: { type: String, required: true },
  graphicsCard:{type:String,required:true},
  operatingSystem:{type:String,required:true},
  WiFi:{type:String,required:true},
  webCamera:{type:String,required:true},
  display:{type:String,required:true},
  weight:{type:String,required:true},
  usb:{type:String,required:true},
  battery:{type:String,required:true},
  categoryName:{type:String,default:'Laptop'},
  comments: {
    type: [commentSchema], // Определяем как массив схемы комментариев
    default: [] // Добавляем пустой массив по умолчанию
  },
});


// const CommentSchema = mongoose.model('Comments', commentSchema);
const CartSchema = mongoose.model('Cart', cartSchema);
const MobileSchema=mongoose.model('Mobile',mobileSchema);
const LaptopSchema=mongoose.model('Laptop',laptopSchema);
const TVSchema=mongoose.model('TV',tvSchema)
const Product = mongoose.model('Product', productSchema);
module.exports = {MobileSchema,LaptopSchema,TVSchema,Product,commentSchema,CartSchema,cartItemSchema};






