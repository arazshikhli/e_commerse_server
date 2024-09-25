const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String },
  stock: { type: Number, default: 0 },
  views: { type: Number, default: 0 }, // Количество просмотров
  purchases: { type: Number, default: 0 }, // Количество покупок
  rating: {
    average: { type: Number, default: 0 }, // Средний рейтинг
    totalRatings: { type: Number, default: 0 }, // Общее количество оценок
    ratingsSum: { type: Number, default: 0 }, // Сумма всех оценок
  },
  comments: [commentSchema], // Комментарии к продукту
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
