const express = require('express');
// const Product = require('../models/Products');
const User = require('../models/Users');
const Cart=require('../models/Products')
const jwt = require('jsonwebtoken');
const router = express.Router();
const ProductModel=require('../models/ProductModel')
const {MobileSchema,TVSchema,LaptopSchema}=require('../models/Products')
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
    // Получаем все продукты для каждой категории
    const tvs = await TVSchema.find();
    const mobiles = await MobileSchema.find();
    const laptops = await LaptopSchema.find();

    // Объединяем все продукты в один массив
    const allProducts = [
      ...tvs.map((product) => ({ categoryName: 'TV', ...product._doc })),
      ...mobiles.map((product) => ({ categoryName: 'Mobile', ...product._doc })),
      ...laptops.map((product) => ({ categoryName: 'Laptop', ...product._doc })),
    ];

    res.status(200).json(allProducts);
  } catch (error) {
    console.error('Ошибка при получении продуктов:', error);
    res.status(500).json({ error: 'Ошибка при получении продуктов. Попробуйте еще раз.' });
  }
};



const addToCart = async (req, res) => {
  const { userId, productId, productType, quantity } = req.body;

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

    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Допустим, у вас есть модель Cart для корзины
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      const newCart = new Cart({
        user: userId,
        items: [{ productId, productType, quantity }],
      });
      await newCart.save();
      return res.status(201).json(newCart);
    }

    const existingItem = cart.items.find(
      (item) => item.productId.toString() === productId && item.productType === productType
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ productId, productType, quantity });
    }

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ error: 'Failed to add product to cart. Please try again.' });
  }
};

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
  const { categoryName,images } = req.body.newData;
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
      console.log(cloudinaryResponses)
     }

  

      switch (categoryName) {
        case 'TV': {
          const { brand, model, price, description, screenSize, resolution, stock, smartTV, comments = [] } = req.body.newData;
          const newTV = new TVSchema({
            brand, model, price, description, imageURL:cloudinaryResponses, screenSize, resolution, stock, smartTV, comments,
          });
          savedProduct = await newTV.save();
          break;
        }
        case 'Mobile': {
          const { brand, model, storage, price, description, screenSize, ram, processor, stock, comments = [] } = req.body.newData;
          const newMobile = new MobileSchema({
            brand, model, price, description, imageURL:cloudinaryResponses, screenSize, ram, processor, stock, storage, comments,
          });
          savedProduct = await newMobile.save();
          break;
        }
        case 'Laptop': {
          const { brand, model, storage, price, description, screenSize, ram, processor, graphicsCard, stock, comments = [] } = req.body.newData;
          const newLaptop = new LaptopSchema({
            brand, model, price, description, imageURL:cloudinaryResponses, screenSize, ram, processor, storage, graphicsCard, stock, comments,
          });
          savedProduct = await newLaptop.save();
          break;
        }
      }

      res.status(201).json(savedProduct);

  } catch (error) {
    console.error('Ошибка при создании продукта:', error);
    res.status(500).json({ error: 'Ошибка при создании продукта. Попробуйте еще раз.' });
  }
};
//  const getAllProducts=async(req,res)=>{
//     const { page = 1, limit = 10 } = req.query;
//     const skip = (page - 1) * limit;
    
//     try {
//       const totalProducts = await Product.countDocuments(); 
//       const products = await Product.find().skip(skip).limit(parseInt(limit));
      
//       res.json({
//         products,
//         totalPages: Math.ceil(totalProducts / limit), 
//         currentPage: page
//       });
//     } catch (error) {
//       res.status(400).json({ error: 'Error fetching products' });
//     }
// }


// const findProductByName=async(req,res)=>{
//   const { name } = req.params;

//   try {
//     const products = await Product.find({ name: { $regex: name, $options: 'i' } }); // Регистронезависимый поиск
//     res.json(products);
//   } catch (error) {
//     res.status(400).json({ error: 'Error fetching products by name' });
//   }
// }

// const getProductsByCategory=async(req,res)=>{
//   const { category } = req.params;

//   try {
//     const products = await Product.find({ category });
//     res.json(products);
//   } catch (error) {
//     res.status(400).json({ error: 'Error fetching products by category' });
//   }
// }

// const getProductsByPrice=async(req,res)=>{
//   const { minPrice = 0, maxPrice = 10000 } = req.query;

//   try {
//     const products = await Product.find({
//       price: { $gte: parseFloat(minPrice), $lte: parseFloat(maxPrice) }
//     });
//     res.json(products);
//   } catch (error) {
//     res.status(400).json({ error: 'Error fetching products by price' });
//   }
// }

// const getProductById=async(req,res)=>{
//   const {id}=req.params;

//   try {
//     const product = await Product.findById(id); 
//     if (!product) {
//       return res.status(404).json({ error: 'Product not found' }); 
//     }
//     res.json(product); 
//   } catch (error) {
//     res.status(400).json({ error: 'Error fetching product by ID' }); 
//   }
// }


module.exports = {
  createProduct,
  getAllProducts,addComment,
  getComments,
  createProductWithImage
};