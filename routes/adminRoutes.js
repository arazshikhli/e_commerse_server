const express = require('express');
const {LaptopSchema,MobileSchema,TVSchema} = require('../models/Products');
const User = require('../models/Users');
const jwt = require('jsonwebtoken');

const {addNewModel,showAllModels, showAllModelNames,}=require('../controllers/modelController')
const router = express.Router();
const {
  getProductById,getAllProducts,addComment,getComments,createProductWithImage,
  addToCart,
  getCart,
  updateCartItemQuantity,
  viewsСounter,
  getCartProducts
}=require('../controllers/productControllers')


// Middleware для проверки прав администратора
const isAdmin = (req, res, next) => {
console.log(req.header);

  const token = req.header('Authorization').replace('Bearer ', '');
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (!decoded.isAdmin) {
    return res.status(403).json({ error: 'Access denied' });
  }
  req.user = decoded;
  next();
};;
router.post('/models' ,addNewModel);
router.get('/models',showAllModels)
router.get('/modelsnames',showAllModelNames)
router.post('/products',createProductWithImage)
router.get('/products',getAllProducts)
router.post('/:id/comments',addComment)
router.get('/comments/:productType/:model',getComments)
router.get('/products/:id',getProductById)
router.post('/cart/add',addToCart)
router.get('/cart/:userId',getCart)
router.get('/carts/:userId',getCartProducts)
router.put('/cart/update',updateCartItemQuantity)
router.post('/:id/view', viewsСounter);
// router.get('/products',getAllProducts);

// // фильтр по имени
// router.get('/products/name/:name', findProductByName);

// //по категориям
// router.get('/products/category/:category', getProductsByCategory);

//  //price
// router.get('/products/price', getProductsByPrice);
// // получение товара по id
// router.get('/products/:id', getProductById)

// // Добавить новый товар


// // Удалить товар
// router.delete('/products/:id', isAdmin, async (req, res) => {
//   try {
//     const product = await Product.findByIdAndDelete(req.params.id);
//     if (!product) {
//       return res.status(404).json({ error: 'Product not found' });
//     }
//     res.json({ message: 'Product deleted' });
//   } catch (error) {
//     res.status(400).json({ error: 'Error deleting product' });
//   }
// });

// // Обновить товар
// router.put('/products/:id', isAdmin, async (req, res) => {
//   try {
//     const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//     });
//     if (!updatedProduct) {
//       return res.status(404).json({ error: 'Product not found' });
//     }
//     res.json(updatedProduct);
//   } catch (error) {
//     res.status(400).json({ error: 'Error updating product' });
//   }
// });

// // Управление пользователями (назначение админа)
// router.put('/users/:id/admin', isAdmin, async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id);
//     if (!user) {
//       return res.status(404).json({ error: 'User not found' });
//     }
//     user.isAdmin = req.body.isAdmin;
//     await user.save();
//     res.json({ message: 'User role updated', user });
//   } catch (error) {
//     res.status(400).json({ error: 'Error updating user role' });
//   }
// });

module.exports = router;
