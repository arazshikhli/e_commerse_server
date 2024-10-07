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

// const __dirname=path.resolve()
const createProduct = async (req, res) => {
  const { categoryName } = req.body;
  console.log('Received request body:', req.body); 
  let savedProduct;
  console.log('categoryname:',categoryName)
  try {
    switch(categoryName){
      case'TV':{
        const { brand, model, price,
           description, imageURL, screenSize,
           resolution, stock, 
          smartTV,comments=[]} = req.body;
        const newTV=new TVSchema({
          brand,price,description,imageURL,screenSize,
          stock,resolution,smartTV,comments,model
        })
        savedProduct=await newTV.save();
        break;
      }
      case 'Mobile':{
        const { brand, model,storage, price,
          description, imageURL, screenSize,
           ram, processor, stock
          ,comments=[]} = req.body;
        const newMobile= new MobileSchema({
          brand, model,price,description,imageURL,screenSize,
          ram,processor,stock,storage,comments
        })
        savedProduct=await newMobile.save();
        break;
      }
      case 'Laptop':{
        const { brand, model,storage, price,
          description, imageURL, screenSize,
           ram, processor,  stock, 
           graphicsCard,comments=[]} = req.body;
        const newLaptop=new LaptopSchema({
          brand, model,price,description,imageURL,screenSize,
          ram,processor,storage,graphicsCard,stock,comments
        })
        savedProduct=await newLaptop.save()
        break;
      }
    }
    
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error('Ошибка при создании продукта:', error);
    res.status(500).json({ error: 'Ошибка при создании продукта. Попробуйте еще раз.' });
  }
};
const getAllProducts = async (req, res) => {
  try {
    // Получаем данные из всех коллекций параллельно
    const [tvs, mobiles, laptops] = await Promise.all([
      TVSchema.find({}),      // Получаем все ТВ продукты
      MobileSchema.find({}),   // Получаем все мобильные продукты
      LaptopSchema.find({})    // Получаем все ноутбуки
    ]);

    // Объединяем все продукты в один массив
    const allProducts = [
      ...tvs.map(tv => ({ ...tv.toObject(), categoryName: 'TV' })),          // Добавляем поле "categoryName" для каждого продукта
      ...mobiles.map(mobile => ({ ...mobile.toObject(), categoryName: 'Mobile' })),
      ...laptops.map(laptop => ({ ...laptop.toObject(), categoryName: 'Laptop' }))
    ];

    // Возвращаем все продукты в ответе
    res.status(200).json(allProducts);

  } catch (error) {
    console.error('Ошибка при получении продуктов:', error);
    res.status(500).json({ error: 'Ошибка при получении продуктов. Попробуйте еще раз.' });
  }
};
const getCart = async (req, res) => {
  const { userId } = req.params;

  try {
    // Находим корзину пользователя по userId
    console.log(Cart.user)
    const cart = await Cart.findOne({ user: userId }).populate('items.productId');

    if (!cart) {
      return res.status(404).json({ message: 'Корзина не найдена' });
    }

    res.status(200).json(cart);
  } catch (error) {
    console.error('Ошибка при получении корзины:', error);
    res.status(500).json({ message: 'Не удалось получить корзину' });
  }
};

const addToCart = async (req, res) => {
  const { userId, productId, productType, quantity } = req.body;

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

    // Поиск существующей корзины пользователя
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      // Создание новой корзины, если её нет
      cart = new Cart({
        user: userId,
        items: [{ productId, productType, quantity }],
      });
      await cart.save();
      return res.status(201).json({data:cart});
    }

    // Поиск товара в корзине
    const existingItem = cart.items.find(
      (item) => item.productId.toString() === productId && item.productType === productType
    );

    if (existingItem) {
      // Обновление количества, если товар уже есть в корзине
      existingItem.quantity += quantity;
    } else {
      // Добавление нового товара в корзину
      cart.items.push({ productId, productType, quantity });
    }

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ error: 'Failed to add product to cart. Please try again.' });
  }
};

const updateCartItemQuantity = async (req, res) => {
  const { userId, productId, productType, quantity } = req.body;

  console.log('productId', productId)
  console.log('userid',userId);
  
  try {
    // Поиск корзины пользователя
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    // Поиск товара в корзине
    const existingItem = cart.items.find(
      (item) => {
          console.log(`Checking item: ${item.productId.toString()} against productId: ${productId} and productType: ${item.productType}`);
          return item.productId.toString() === productId && item.productType === productType;
      }
  );

    if (!existingItem) {
      return res.status(404).json({ error: 'Product not found in cart' });
    }

    // Обновление количества товара
    if (quantity <= 0) {
      // Удаление товара из корзины, если количество меньше или равно нулю
      cart.items = cart.items.filter(item => item.productId.toString() !== productId || item.productType !== productType);
    } else {
      // Установка нового количества
      existingItem.quantity = quantity;
    }

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    console.error('Error updating cart item quantity:', error);
    res.status(500).json({ error: 'Failed to update product quantity in cart. Please try again.' });
  }
};

// Экспортируйте контроллер

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
          });
          savedProduct = await newTV.save();
          break;
        }
        case 'Mobile': {
          const { brand, model, storage, price, description, screenSize, ram, processor, stock, comments = [] } = req.body;
          const newMobile = new MobileSchema({
            brand, model, price, description, imageURL:cloudinaryResponses, screenSize, ram, processor, stock, storage, comments,
          });
          savedProduct = await newMobile.save();
          break;
        }
        case 'Laptop': {
          const { brand, model, storage, price, description, screenSize, ram, processor, graphicsCard, stock, comments = [] } = req.body;
          const newLaptop = new LaptopSchema({
            brand, model, price, description, imageURL:cloudinaryResponses, screenSize, ram, processor, storage, graphicsCard, stock, comments,
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


module.exports = {
  createProduct,
  getAllProducts,addComment,
  getComments,
  createProductWithImage,
  getProductById,
  addToCart,
  getCart,
  updateCartItemQuantity
};