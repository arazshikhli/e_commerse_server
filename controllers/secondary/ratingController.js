const {
  LaptopSchema,
  MobileSchema,
  TVSchema,
} = require("../../models/Products");
const addRatingToProduct = async (req, res) => {
  const { productId } = req.params; // Получаем ID продукта из URL
  const { rating } = req.body; // Получаем новый рейтинг из тела запроса

  try {
    // Найдем продукт по ID
    let product;

    switch (req.body.categoryName) {
      case "Mobile": {
        product = await MobileSchema.findById(productId);
        break;
      }
      case "Laptop": {
        product = await LaptopSchema.findById(productId);
        break;
      }
      case "TV": {
        product = await TVSchema.findById(productId);
        break;
      }
      default:
        return res.status(400).json({ message: "Invalid category" });
    }

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const newTotalRatings = product.rating.totalRatings + 1; // Увеличиваем количество оценок
    const newAverageRating =
      (product.rating.average * product.rating.totalRatings + rating) /
      newTotalRatings; // Рассчитываем новое среднее

    // Обновляем рейтинг продукта
    product.rating.average = newAverageRating;
    product.rating.totalRatings = newTotalRatings;

    // Сохраняем изменения в базе данных
    await product.save();

    return res
      .status(200)
      .json({ message: "Rating added successfully", updatedProduct: product });
  } catch (error) {
    console.error("Ошибка при добавлении рейтинга:", error);
    return res
      .status(500)
      .json({ message: "Ошибка сервера. Попробуйте еще раз." });
  }
};
const getAverageRating = async (req, res) => {
  const { productId } = req.params; // Получаем ID продукта из URL

  try {
    // Найдем продукт по ID
    let product;

    switch (req.query.categoryName) {
      case "Mobile": {
        product = await MobileSchema.findById(productId);
        break;
      }
      case "Laptop": {
        product = await LaptopSchema.findById(productId);
        break;
      }
      case "TV": {
        product = await TVSchema.findById(productId);
        break;
      }
      default:
        return res.status(400).json({ message: "Invalid category" });
    }

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Извлекаем средний рейтинг
    const averageRating = product.rating.average || 0; // Если рейтинга еще нет, возвращаем 0

    // Возвращаем средний рейтинг продукта
    return res.status(200).json({ averageRating });
  } catch (error) {
    console.error("Ошибка при получении среднего рейтинга:", error);
    return res
      .status(500)
      .json({ message: "Ошибка сервера. Попробуйте еще раз." });
  }
};

module.exports = { addRatingToProduct, getAverageRating };
