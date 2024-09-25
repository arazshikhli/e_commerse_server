const express = require('express');
const router = express.Router();
const User = require('../models/Users.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const adminMiddleware=require('../middleware/adminMiddleware.js')

// Регистрация
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const user = await User.create({ name, email, password });
    res.status(201).json({ message: 'User registered', user });
  } catch (error) {
    res.status(400).json({ error: 'User registration failed' });
  }
});

// Авторизация
router.post('/login', async (req, res) => {
  console.log('Login request received'); // Лог для отслеживания
  console.log('Request body:', req.body); // Лог тела запроса
  const { email, password } = req.body;
  console.log(email)
  try {
    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, {
        expiresIn: '1h',
      });
      res.json({ token });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(400).json({ error: `loginFailed: ${error.message}` });
  }
});

router.put('/:id/make-admin', adminMiddleware, async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Назначаем пользователя администратором
      user.isAdmin = true;
      await user.save();
      
      res.json({ message: 'User promoted to admin successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error updating user role', error });
    }
  });
  
  // Защищенный маршрут для снятия прав администратора
  router.put('/:id/remove-admin', adminMiddleware, async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Снимаем права администратора
      user.isAdmin = false;
      await user.save();
      
      res.json({ message: 'Admin rights removed successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error updating user role', error });
    }
  });
  

module.exports = router;
