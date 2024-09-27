const express = require('express');
const Product = require('../models/Products.js');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

// Добавить комментарий к товару
router.post('/:id/comments', authMiddleware,async (req, res) => {
  const { comment } = req.body;
  const userId = req.user.id; // Получаем ID пользователя из JWT
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    product.comments.push({ user: userId, comment });
    await product.save();
    res.json(product.comments);
  } catch (error) {
    res.status(400).json({ error: 'Error adding comment' });
  }
});

  

router.post('/:id/rating', authMiddleware,async (req, res) => {
  const { rating } = req.body; 
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

 
    product.rating.ratingsSum += rating;
    product.rating.totalRatings += 1;
    product.rating.average = product.rating.ratingsSum / product.rating.totalRatings;

    await product.save();
    res.json({ averageRating: product.rating.average });
  } catch (error) {
    res.status(400).json({ error: 'Error adding rating' });
  }
});


router.post('/:id/view', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    product.views += 1;
    await product.save();
    res.json({ views: product.views });
  } catch (error) {
    res.status(400).json({ error: 'Error updating views' });
  }
});


router.post('/:id/purchase', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    product.purchases += 1;
    await product.save();
    res.json({ purchases: product.purchases });
  } catch (error) {
    res.status(400).json({ error: 'Error updating purchases' });
  }
});

router.get('/:id', async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.json(product); 
    } catch (error) {
      res.status(400).json({ error: 'Error fetching product' });
    }
  });


module.exports = router;
