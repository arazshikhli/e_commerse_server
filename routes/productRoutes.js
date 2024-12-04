const express = require('express');
const Product = require('../models/Products.js');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {addComment}=require('../controllers/productControllers.js')


module.exports = router;
