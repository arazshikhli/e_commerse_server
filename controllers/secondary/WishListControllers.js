const express = require('express');
const User = require('../../models/Users');
const jwt = require('jsonwebtoken');
const router = express.Router();
const {MobileSchema,TVSchema,LaptopSchema,Cart}=require('../../models/Products')


const addToWishList=async(req,res)=>{
    const {userId,productId,productType}=req.body;
    console.log(userId)
    if (!userId || !productId || !productType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    try{
      const productModelMap = {
        TV: TVSchema,
        Mobile: MobileSchema,
        Laptop: LaptopSchema,
      };
      const productModel = productModelMap[productType];
      const product = await productModel.findById(productId);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
  
      const user = await User.findById(userId);
      console.log(user)
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      const existingItem = user.wishList.find(
        (item) => item && item.productId && item.productId.toString() === productId && item.productType === productType
      );
      
      if (existingItem) {
          return res.status(400).json({message:'already in wish list'})
      } else {
        user.wishList.push({ productId, productType});
      }
      await user.save();
      return res.status(200).json(user.wishList)
    }
    catch(error){
      console.error('Error adding to wish list:', error);
      res.status(500).json({ error: 'Failed to add product to wishList' });
    
    }
  }

  const getWishList=async(req,res)=>{
    const { userId } = req.params;
  
    if (!userId) {
      return res.status(400).json({ message: "Login or register to make a cart" });
    }
    try {
      const user = await User.findById(userId).populate('wishList.productId');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      if (!user.wishList || user.wishList.length === 0) {
        return res.status(404).json({ message: 'WishList is empty' });
      }

      res.status(200).json(user.wishList)

    }
    catch(error){
      console.error('Error fetching wishList:', error);
      res.status(500).json({ message: 'Failed to retrieve wishList' });
    
    }

  }

  const getWishListProducts=async(req,res)=>{
    const { userId } = req.params;
  
    if (!userId) {
      return res.status(400).json({ message: "Login or register to make a cart" });
    }
  
    try{
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      if (!user.wishList || user.wishList.length === 0) {
        return res.status(404).json({ message: 'WishList is empty' });
      }
      const productIds=user.wishList.map(wishListItem=>wishListItem.productId)
      const tvProducts = await TVSchema.find({ _id: { $in: productIds } });
      const mobileProducts = await MobileSchema.find({ _id: { $in: productIds } });
      const desktopProducts = await LaptopSchema.find({ _id: { $in: productIds } });
      const products = [...tvProducts, ...mobileProducts, ...desktopProducts];
      
      const fullWishList = user.wishList.map(wishListItem => {
        const product = products.find(p => p._id.toString() === wishListItem.productId.toString());
        return {
          product,
        };
      }).filter(item => item.product); 
      res.status(200).json(fullWishList)
    }

  
    catch(error)
    {
      console.error('Error fetching WishList products:', error);
      res.status(500).json({ message: 'Failed to retrieve WishList products' });
    
    }
  }

  module.exports={addToWishList,getWishList,getWishListProducts}