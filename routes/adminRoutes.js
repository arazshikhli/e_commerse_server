const express = require("express");
const { LaptopSchema, MobileSchema, TVSchema } = require("../models/Products");
const User = require("../models/Users");
const jwt = require("jsonwebtoken");
const {
  addNewModel,
  showAllModels,
  showAllModelNames,
} = require("../controllers/modelController");
const router = express.Router();
const {
  getAverageRating,
  addRatingToProduct,
} = require("../controllers/secondary/ratingController");
const {
  getProductById,
  getAllProducts,
  addComment,
  getComments,
  createProductWithImage,
  updateCartItemQuantity,
  viewsСounter,
  getProductsByCategory,
  deleteSelectedProducts,
  updateMobile,
  updateTV,
  refreshToken,
} = require("../controllers/productControllers");
const {
  addToCart,
  getCart,
  getCartProducts,
} = require("../controllers/secondary/cartControllers");
const {
  addToWishList,
  getWishList,
  getWishListProducts,
  removeFromWishList,
} = require("../controllers/secondary/WishListControllers");
// Middleware для проверки прав администратора
const isAdmin = (req, res, next) => {
  const token = req.header("Authorization").replace("Bearer ", "");
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (!decoded.isAdmin) {
    return res.status(403).json({ error: "Access denied" });
  }
  req.user = decoded;
  next();
};
router.post("/models", addNewModel);
router.get("/models", showAllModels);
router.get("/modelsnames", showAllModelNames);
router.post("/products", createProductWithImage);
router.get("/products", getAllProducts);
// router.get('/products/filter',getFilteredProducts)
router.post("/:id/comments", addComment);
router.get("/comments/:productType/:model", getComments);
router.get("/products/:id", getProductById);
router.post("/cart/add", addToCart);
router.get("/cart/:userId", getCart);
router.get("/carts/:userId", getCartProducts);
router.post("/wish/add", addToWishList);
router.get("/wish/:userId", getWishList);
router.get("/wishproducts/:userId", getWishListProducts);
router.delete("/wishproducts/:userId", removeFromWishList);
router.put("/cart/update", updateCartItemQuantity);
router.post("/:id/view", viewsСounter);
router.get("/productsByCategory/:category", getProductsByCategory);
router.get("/products", getAllProducts);
router.delete("/products", deleteSelectedProducts);
router.put("/products/mobile/:id", isAdmin, updateMobile);
router.put("/products/tv/:id", isAdmin, updateTV);
router.post("/products/rating/:productId", addRatingToProduct);
router.get(
  "products/rating/:productId?categoryName=:categoryName",
  getAverageRating
);

// // фильтр по имени
// router.get('/products/name/:name', findProductByName);

// //по категориям
// router.get('/products/category/:category', getProductsByCategory);

//  //price
// router.get('/products/price', getProductsByPrice);
// // получение товара по id
// router.get('/products/:id', getProductById)

// // Добавить новый товар

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
