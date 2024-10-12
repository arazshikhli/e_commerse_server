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
          });
          savedProduct = await newTV.save();
          break;
        }
        case 'Mobile': {
          const { brand, model, storage, price, description, screenSize, ram, processor, stock, comments = [],  battery,operatingSystem,
            displayType,batteryCapacity,weight,network } = req.body;
          const newMobile = new MobileSchema({
            brand, model, price, description, imageURL:cloudinaryResponses, screenSize, ram, processor, stock, storage, comments,  battery,operatingSystem,
            displayType,batteryCapacity,weight,network
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
             battery
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
  getAllProducts,addComment,
  getComments,
  createProductWithImage,
  getProductById,
  addToCart,
  getCart,
  updateCartItemQuantity,
  viewsСounter,
  getCartProducts
};