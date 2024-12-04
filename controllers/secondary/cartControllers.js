const express = require("express");
const User = require("../../models/Users");
const jwt = require("jsonwebtoken");
const router = express.Router();
const ProductModel = require("../../models/ProductModel");
const logger = require("../../logger");
const {
  MobileSchema,
  TVSchema,
  LaptopSchema,
  Cart,
} = require("../../models/Products");
const cloudinary = require("../../config/cloudinary");

// Контроллер для получения продуктов корзины
const getCartProducts = async (req, res) => {
  logger.info("Запрос на получение продуктов в корзине");
  const { userId } = req.params;

  if (!userId) {
    logger.warn("Пользователь не авторизован");
    return res
      .status(400)
      .json({ message: "Login or register to make a cart" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      logger.warn(`Пользователь с ID ${userId} не найден`);
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.cart || user.cart.length === 0) {
      logger.info(`Корзина пользователя ${userId} пуста`);
      return res.status(404).json({ message: "Cart is empty" });
    }

    const productIds = user.cart.map((item) => item.productId);
    const [tvProducts, mobileProducts, desktopProducts] = await Promise.all([
      TVSchema.find({ _id: { $in: productIds } }),
      MobileSchema.find({ _id: { $in: productIds } }),
      LaptopSchema.find({ _id: { $in: productIds } }),
    ]);

    const products = [...tvProducts, ...mobileProducts, ...desktopProducts];
    const fullCart = user.cart
      .map((cartItem) => {
        const product = products.find(
          (p) => p._id.toString() === cartItem.productId.toString()
        );
        return { product, quantity: cartItem.quantity };
      })
      .filter((item) => item.product);

    logger.info(`Найдено ${fullCart.length} товаров в корзине`);
    res.status(200).json(fullCart);
  } catch (error) {
    logger.error("Ошибка при получении корзины", error);
    res.status(500).json({ message: "Failed to retrieve cart" });
  }
};

// Контроллер для добавления товара в корзину
const addToCart = async (req, res) => {
  const { userId, productId, productType, quantity } = req.body;

  if (!userId || !productId || !productType || quantity === undefined) {
    logger.warn("Отсутствуют обязательные поля в запросе");
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const productModelMap = {
      TV: TVSchema,
      Mobile: MobileSchema,
      Laptop: LaptopSchema,
    };
    const productModel = productModelMap[productType];

    if (!productModel) {
      logger.warn(`Неверный тип продукта: ${productType}`);
      return res.status(400).json({ error: "Invalid product type" });
    }

    const product = await productModel.findById(productId);
    if (!product) {
      logger.warn(`Продукт с ID ${productId} не найден`);
      return res.status(404).json({ error: "Product not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      logger.warn(`Пользователь с ID ${userId} не найден`);
      return res.status(404).json({ error: "User not found" });
    }

    const existingItem = user.cart.find(
      (item) =>
        item.productId.toString() === productId &&
        item.productType === productType
    );

    if (existingItem) {
      existingItem.quantity += quantity;
      logger.info(
        `Обновлено количество продукта ${productId} в корзине пользователя ${userId}`
      );
    } else {
      user.cart.push({ productId, productType, quantity });
      logger.info(
        `Добавлен новый продукт ${productId} в корзину пользователя ${userId}`
      );
    }

    await user.save();
    res.status(200).json(user.cart);
  } catch (error) {
    logger.error("Ошибка при добавлении в корзину", error);
    res.status(500).json({ error: "Failed to add product to cart" });
  }
};

// Контроллер для получения корзины
const getCart = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    logger.warn("Пользователь не авторизован");
    return res
      .status(400)
      .json({ message: "Login or register to make a cart" });
  }

  try {
    const user = await User.findById(userId).populate("cart.productId");
    if (!user) {
      logger.warn(`Пользователь с ID ${userId} не найден`);
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.cart || user.cart.length === 0) {
      logger.info(`Корзина пользователя ${userId} пуста`);
      return res.status(404).json({ message: "Cart is empty" });
    }

    logger.info(`Корзина пользователя ${userId} успешно загружена`);
    res.status(200).json(user.cart);
  } catch (error) {
    logger.error("Ошибка при получении корзины", error);
    res.status(500).json({ message: "Failed to retrieve cart" });
  }
};

module.exports = { addToCart, getCart, getCartProducts };
