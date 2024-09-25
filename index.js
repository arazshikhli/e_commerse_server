require('dotenv').config()
const cors=require('cors')
const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/userRoutes.js');
const productRoutes = require('./routes/productRoutes.js');
const adminRoutes = require('./routes/adminRoutes.js');
const app = express();

const corsOptions = {
  origin: '*', // Разрешаем всем доменам
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Разрешаем эти методы
  allowedHeaders: ['Content-Type', 'Authorization'], // Разрешаем заголовки
};
// Middlewares
app.use(express.json());
app.use(cors(corsOptions))

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
}).then(() => console.log('MongoDB connected')).catch((err) => console.log(err));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes);

// Server setup
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});