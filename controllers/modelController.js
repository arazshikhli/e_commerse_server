const express = require('express');
const User = require('../models/Users');
const jwt = require('jsonwebtoken');
const router = express.Router();
const ProductModel=require('../models/ProductModel')

const addNewModel=async(req,res)=>{
    const { categoryName, attributes } = req.body;
  console.log(req.body);
  
    try {
      const newProductModel = new ProductModel({ categoryName, attributes });
      await newProductModel.save();
      res.status(201).json({ message: 'Product model created', model: newProductModel });
    } catch (error) {
      res.status(400).json({ error: error.message});
    }
  }
  const showAllModels=async(req,res)=>{
    try {
      const models = await ProductModel.find(); 
      
      res.status(200).json(models); 
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve models' });
    }
  }

  const showAllModelNames = async (req, res) => {
    try {
      const models = await ProductModel.find().select('categoryName -_id');
      
      res.status(200).json(models);
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve model names' });
    }
  };

  module.exports={addNewModel,showAllModels,showAllModelNames};

