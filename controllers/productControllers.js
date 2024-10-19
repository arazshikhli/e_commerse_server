const express = require('express');
// const Product = require('../models/Products');
const User = require('../models/Users');
// const Cart=require('../models/Products')
const jwt = require('jsonwebtoken');
const router = express.Router();
const ProductModel=require('../models/ProductModel')
const {MobileSchema,TVSchema,LaptopSchema,Cart}=require('../models/Products')
const cloudinary = require('../config/cloudinary');

const path=require('path')
const getAllProducts = async (req, res) => {
  try {
   
    const [tvs, mobiles, laptops] = await Promise.all([
      TVSchema.find({}),     
      MobileSchema.find({}),  
      LaptopSchema.find({})    
    ]);


    const allProducts = [
      ...tvs.map(tv => ({ ...tv.toObject(), categoryName: 'TV' })),          // Добавляем поле "categoryName" для каждого продукта
      ...mobiles.map(mobile => ({ ...mobile.toObject(), categoryName: 'Mobile' })),
      ...laptops.map(laptop => ({ ...laptop.toObject(), categoryName: 'Laptop' }))
    ];
    res.status(200).json(allProducts);

  } catch (error) {
    console.error('Ошибка при получении продуктов:', error);
    res.status(500).json({ error: 'Ошибка при получении продуктов. Попробуйте еще раз.' });
  }
};

const getFilteredProducts=async(req,res)=>{

}
const deleteSelectedProducts=async(req,res)=>{
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: 'Некорректный массив ID' });
  }
  try {
    const deletedProducts = await MobileSchema.deleteMany({ _id: { $in: ids } });
    res.status(200).json({ message: `${deletedProducts.deletedCount} продуктов успешно удалено` });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
}
const getProductsByCategory = async (req, res) => {
  const { category } = req.params; // Извлекаем category из параметров URL
  let products;

  console.log(category)
  try {
    switch (category) {
      case 'Mobile': {
        products = await MobileSchema.find({}); // Асинхронный запрос к базе данных
        break;
      }
      case 'TV': {
        products = await TVSchema.find({});
        break;
      }
      case 'Laptop': {
        products = await LaptopSchema.find({});
        break;
      }
      default: {
        return res.status(400).json({ message: "Category not found" }); // Возвращаем ошибку, если категория не найдена
      }
    }

    // Возвращаем результат
    return res.status(200).json( products );

  } catch (error) {
    // Обработка ошибок
    console.error('Ошибка при получении продуктов:', error);
    return res.status(500).json({ message: 'Ошибка сервера. Попробуйте еще раз.' });
  }
};


const updateCartItemQuantity = async (req, res) => {
  const { userId, productId, productType, quantity } = req.body;

  if (!userId || !productId || !productType || quantity === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Поиск пользователя и его корзины
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Поиск товара в корзине пользователя
    const existingItem = user.cart.find(
      (item) => item.productId.toString() === productId && item.productType === productType
    );

    if (!existingItem) {
      return res.status(404).json({ error: 'Product not found in cart' });
    }

    // Обновление количества товара
    if (quantity <= 0) {
      // Удаление товара из корзины, если количество меньше или равно нулю
      user.cart = user.cart.filter(item => item.productId.toString() !== productId || item.productType !== productType);
    } else {
      // Установка нового количества
      existingItem.quantity = quantity;
    }

    await user.save();
    res.status(200).json(user.cart);
  } catch (error) {
    console.error('Error updating cart item quantity:', error);
    res.status(500).json({ error: 'Failed to update product quantity in cart. Please try again.' });
  }
};

// Экспортируйте контроллер
const viewsСounter=async(req,res)=>{
  const {id,category}=req.body;
  
  let productModel;
  let product;
  try{
    switch(category){
      case 'TV':{
        product=await TVSchema.findById(id);
        if(!product)return res.status(404).json({error:'Product not found'});
        product.views+=1;
        await product.save()
        console.log("view:",product.views);
        
        res.json({ views: product.views });
        break;
      }
      case 'Mobile':{
        product=await MobileSchema.findById(id);
        if(!product)return res.status(404).json({error:'Product not found'});
        product.views+=1;
        await product.save();
        console.log("view:",product.views);
        
        res.json({ views: product.views });
        break;
      }
      case 'Laptop':{
        product=await MobileSchema.findById(id);
        if(!product)return res.status(404).json({error:'Product not found'});
        product.views+=1;
        await product.save()
        console.log("view:",product.views);
        
        res.json({ views: product.views });
        break;
      }
    }
  }
 catch (error) {
    res.status(400).json({ error: 'Error updating views' });
  }
}
const addComment = async (req, res) => {
  const { model, productType, user, commentText } = req.body;
  console.log("model: ",model);
  
  try {
    let productModel;
    switch (productType) {
      case 'TV':
        productModel = TVSchema;
        break;
      case 'Mobile':
        productModel = MobileSchema;
        break;
      case 'Laptop':
        productModel = LaptopSchema;
        break;
      default:
        return res.status(400).json({ error: 'Invalid product type' });
    }

    console.log('email:',user);
    
    
    const userData = await User.findOne({ email: user });
    if (!userData) {
      return res.status(404).json({ message: 'User not found' });
    }

    const product = await productModel.findOne({model:model});
    console.log("model:comment:",model)
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const newComment = {
      user:userData,
      comment: commentText,
      createdAt: new Date(),
    };

    product.comments.push(newComment);
    await product.save();

    res.status(200).json(product);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Failed to add comment. Please try again.' });
  }
};

const getComments = async (req, res) => {
  const { model, productType } = req.params;

  try {
    let productModel;
    switch (productType) {
      case 'TV':
        productModel = TVSchema;
        break;
      case 'Mobile':
        productModel = MobileSchema;
        break;
      case 'Laptop':
        productModel = LaptopSchema;
        break;
      default:
        return res.status(400).json({ error: 'Invalid product type' });
    }


    const product = await productModel.findOne({ model:model });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

   
    res.status(200).json(product.comments);
  } catch (error) {
    console.error('Error retrieving comments:', error);
    res.status(500).json({ error: 'Failed to retrieve comments. Please try again.' });
  }
};

const createProductWithImage = async (req, res) => {
  const { categoryName,images } = req.body;
  
  let savedProduct;
  let cloudinaryResponses=[];
  try {
    if(Array.isArray(images)&& images.length>0){
 
      for( const image of images){
        try{
          const cloudinaryResponse=await cloudinary.uploader.upload(image,{folder:'products'});
          cloudinaryResponses.push(cloudinaryResponse.secure_url)
        }
        catch(err){
            console.log("Error uploading image");
            return res.status(500).json({
              message:"Image upload failed",
              error:err.message|| "unknow error"
            })
        } 
      }
     }

  

      switch (categoryName) {
        case 'TV': {
          const { brand, model, price, description, screenSize, resolution, stock, smartTV, comments = [] } = req.body;
          const newTV = new TVSchema({
            brand, model, price, description, imageURL:cloudinaryResponses, screenSize, resolution, stock, smartTV, comments,
            rating: { average: 0, totalRatings: 0 },
          });
          savedProduct = await newTV.save();
          break;
        }
        case 'Mobile': {
          const { brand, model, storage, price, description, screenSize, ram, processor, stock, comments = [],  battery,operatingSystem,
            displayType,batteryCapacity,weight,network } = req.body;
          const newMobile = new MobileSchema({
            brand, model, price, description, imageURL:cloudinaryResponses, screenSize, ram, processor, stock, storage, comments,  battery,operatingSystem,
            displayType,batteryCapacity,weight,network,
            rating: { average: 0, totalRatings: 0 },
          });
          savedProduct = await newMobile.save();
          break;
        }
        case 'Laptop': {
          const { brand, model, storage, price, description,
             screenSize, ram, processor, graphicsCard,
             stock, comments = [],
            operatingSystem,
            WiFi,
            webCamera,
            display,
            weight,
            usb,
            battery
            } = req.body;
          const newLaptop = new LaptopSchema({
            brand, model, price, description, imageURL:cloudinaryResponses,
             screenSize, ram, processor, storage, graphicsCard, stock, comments,
             operatingSystem,
             WiFi,
             webCamera,
             display,
             weight,
             usb,
             battery,
             rating: { average: 0, totalRatings: 0 },
          });
          savedProduct = await newLaptop.save();
          break;
        }
      }

      res.status(201).json({message:'Product added successfully'});

  } catch (error) {
    console.error('Ошибка при создании продукта:', error);
    res.status(500).json({ error: 'Ошибка при создании продукта. Попробуйте еще раз.' });
  }
};
const getProductById = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Получаем данные из всех коллекций параллельно
    const [tv, mobile, laptop] = await Promise.all([
      TVSchema.findById(id),       // Получаем продукт TV по ID
      MobileSchema.findById(id),   // Получаем мобильный продукт по ID
      LaptopSchema.findById(id)    // Получаем ноутбук по ID
    ]);
    
    // Проверяем, существует ли продукт в одной из коллекций
    if (!tv && !mobile && !laptop) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Возвращаем найденный продукт
    if (tv) {
      return res.json(tv);
    } else if (mobile) {
      return res.json(mobile);
    } else if (laptop) {
      return res.json(laptop);
    }
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    return res.status(400).json({ error: 'Error fetching product by ID' });
  }
};
const updateMobile=async(req,res)=>{
  const idFromParams=req.params.id;
  const mobile=req.body
  console.log("mobile: ",mobile)
  try {
    const updatedMobile=await MobileSchema.findByIdAndUpdate(idFromParams,mobile,{new:true})
    if (!updatedMobile) {
             return res.status(404).json({ error: 'Product not found' });
          }
          res.json(updatedMobile)
  } catch (error) {
    res.status(400).json({ error: 'Error updating product' });
  }
}

const updateTV=async(req,res)=>{
  const idFromParams=req.params.id;
  const tv=req.body
  console.log("mobile: ",tv)
  try {
    const updatedTV=await TVSchema.findByIdAndUpdate(idFromParams,tv,{new:true})
    if (!updatedTV) {
             return res.status(404).json({ error: 'TV not found' });
          }
          res.json(updatedTV)
  } catch (error) {
    res.status(400).json({ error: 'Error updating TV' });
  }
}


module.exports = {
  getAllProducts,addComment,
  getComments,
  createProductWithImage,
  getProductById,
  updateCartItemQuantity,
  viewsСounter,
  getProductsByCategory,
  deleteSelectedProducts,
  updateMobile,
  updateTV,
};