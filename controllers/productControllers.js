const express = require('express');
const Product = require('../models/Products');
const User = require('../models/Users');
const jwt = require('jsonwebtoken');
const router = express.Router();

 const getAllProducts=async(req,res)=>{
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    
    try {
      const totalProducts = await Product.countDocuments(); 
      const products = await Product.find().skip(skip).limit(parseInt(limit));
      
      res.json({
        products,
        totalPages: Math.ceil(totalProducts / limit), 
        currentPage: page
      });
    } catch (error) {
      res.status(400).json({ error: 'Error fetching products' });
    }
}

const findProductByName=async(req,res)=>{
  const { name } = req.params;

  try {
    const products = await Product.find({ name: { $regex: name, $options: 'i' } }); // Регистронезависимый поиск
    res.json(products);
  } catch (error) {
    res.status(400).json({ error: 'Error fetching products by name' });
  }
}

const getProductsByCategory=async(req,res)=>{
  const { category } = req.params;

  try {
    const products = await Product.find({ category });
    res.json(products);
  } catch (error) {
    res.status(400).json({ error: 'Error fetching products by category' });
  }
}

const getProductsByPrice=async(req,res)=>{
  const { minPrice = 0, maxPrice = 10000 } = req.query;

  try {
    const products = await Product.find({
      price: { $gte: parseFloat(minPrice), $lte: parseFloat(maxPrice) }
    });
    res.json(products);
  } catch (error) {
    res.status(400).json({ error: 'Error fetching products by price' });
  }
}

const getProductById=async(req,res)=>{
  const {id}=req.params;

  try {
    const product = await Product.findById(id); 
    if (!product) {
      return res.status(404).json({ error: 'Product not found' }); 
    }
    res.json(product); 
  } catch (error) {
    res.status(400).json({ error: 'Error fetching product by ID' }); 
  }
}






module.exports = {getAllProducts,
  findProductByName,
  getProductsByCategory,
  getProductsByPrice,
  getProductById
};