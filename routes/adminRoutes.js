const express = require('express');
const Product = require('../models/Products');
const User = require('../models/Users');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Middleware для проверки прав администратора
const isAdmin = (req, res, next) => {
  const token = req.header('Authorization').replace('Bearer ', '');
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (!decoded.isAdmin) {
    return res.status(403).json({ error: 'Access denied' });
  }
  req.user = decoded;
  next();
};

router.get('/products', async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;
  
  try {
    const totalProducts = await Product.countDocuments(); // Total number of products
    const products = await Product.find().skip(skip).limit(parseInt(limit));
    
    res.json({
      products,
      totalPages: Math.ceil(totalProducts / limit), // Calculate total pages
      currentPage: page
    });
  } catch (error) {
    res.status(400).json({ error: 'Error fetching products' });
  }
});


// Добавить новый товар
router.post('/products', async (req, res) => {
  // const { name, description, price, stock, image } = req.body;
  const {model,brand,description,price,productDetails,stock,image}=req.body
  try{
    const product=new Product({
      model,
      brand,description,
      price,
      stock,
      productDetails,
      image
    })
    await product.save()
    
    res.status(201).json({
      message:"Product added successfully",product
    })

  }
  catch (error){
    res.status(400).json({error:"Error adding product"})
  }

});

// Удалить товар
router.delete('/products/:id', isAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(400).json({ error: 'Error deleting product' });
  }
});

// Обновить товар
router.put('/products/:id', isAdmin, async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updatedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ error: 'Error updating product' });
  }
});

// Управление пользователями (назначение админа)
router.put('/users/:id/admin', isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    user.isAdmin = req.body.isAdmin;
    await user.save();
    res.json({ message: 'User role updated', user });
  } catch (error) {
    res.status(400).json({ error: 'Error updating user role' });
  }
});

module.exports = router;
