const express = require('express');
// const Product = require('../models/Products');
const User = require('../../models/Users');
// const Cart=require('../models/Products');
const jwt = require('jsonwebtoken');
const router = express.Router();
const ProductModel=require('../../models/ProductModel')
const {MobileSchema,TVSchema,LaptopSchema,Cart}=require('../../models/Products')
const cloudinary = require('../../config/cloudinary');

const getCartProducts = async (req, res) => {
    const { userId } = req.params;
  
    if (!userId) {
      return res.status(400).json({ message: "Login or register to make a cart" });
    }
  
    try {
      // Находим пользователя и его корзину
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      if (!user.cart || user.cart.length === 0) {
        return res.status(404).json({ message: 'Cart is empty' });
      }
  
      // Извлекаем все productId из корзины
      const productIds = user.cart.map(cartItem => cartItem.productId);
  
      // Находим продукты по productIds из разных коллекций
      const tvProducts = await TVSchema.find({ _id: { $in: productIds } });
      const mobileProducts = await MobileSchema.find({ _id: { $in: productIds } });
      const desktopProducts = await LaptopSchema.find({ _id: { $in: productIds } });
  
      // Объединяем все найденные продукты в один массив
      const products = [...tvProducts, ...mobileProducts, ...desktopProducts];
  
      // Сопоставляем продукты с корзиной пользователя для получения количества
      const fullCart = user.cart.map(cartItem => {
        const product = products.find(p => p._id.toString() === cartItem.productId.toString());
        return {
          product,
          quantity: cartItem.quantity,
        };
      }).filter(item => item.product); // Фильтруем те элементы, для которых продукты найдены
  
      res.status(200).json(fullCart);
    } catch (error) {
      console.error('Error fetching cart:', error);
      res.status(500).json({ message: 'Failed to retrieve cart' });
    }
  };
  const getCart = async (req, res) => {
    const { userId } = req.params;
  
    if (!userId) {
      return res.status(400).json({ message: "Login or register to make a cart" });
    }
  
    try {
      // Поиск пользователя по userId и загрузка его корзины
      const user = await User.findById(userId).populate('cart.productId');
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      if (!user.cart || user.cart.length === 0) {
        return res.status(404).json({ message: 'Cart is empty' });
      }
  
      // console.log("userCart",user.cart)
      res.status(200).json(user.cart);
    } catch (error) {
      console.error('Error fetching cart:', error);
      res.status(500).json({ message: 'Failed to retrieve cart' });
    }
  };
  const addToCart = async (req, res) => {
    const { userId, productId, productType, quantity } = req.body;
  
    if (!userId || !productId || !productType || quantity === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
  
    try {
      const productModelMap = {
        TV: TVSchema,
        Mobile: MobileSchema,
        Laptop: LaptopSchema,
      };
  
      const productModel = productModelMap[productType];
      if (!productModel) {
        return res.status(400).json({ error: 'Invalid product type' });
      }
  
      const product = await productModel.findById(productId);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
  
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      // Поиск товара в корзине
      const existingItem = user.cart.find(
        (item) => item.productId.toString() === productId && item.productType === productType
      );
  
      if (existingItem) {
        // Обновление количества, если товар уже есть в корзине
        existingItem.quantity += quantity;
      } else {
        // Добавление нового товара в корзину
        user.cart.push({ productId, productType, quantity });
      }
  
      await user.save();
      res.status(200).json(user.cart);
    } catch (error) {
      console.error('Error adding to cart:', error);
      res.status(500).json({ error: 'Failed to add product to cart' });
    }
  };

  module.exports={addToCart,getCart,getCartProducts}