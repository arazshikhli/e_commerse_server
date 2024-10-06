const express = require('express');
const router = express.Router();
const User = require('../models/Users.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const adminMiddleware=require('../middleware/adminMiddleware.js')


router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Проверка на существование пользователя с таким же email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    // Хешируем пароль перед сохранением
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создаем нового пользователя
    const newUser = await User.create({ name, email, password: hashedPassword,isAdmin:false });

    // Генерируем JWT токен
    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, isAdmin: false }, // Параметры токена
      process.env.JWT_SECRET, // Секретный ключ для подписи токена (должен быть в переменных окружения)
      { expiresIn: '1h' } // Время действия токена
    );

    // Возвращаем ответ с токеном
    res.status(201).json({
      message: 'User registered',
      token, // Отправляем токен клиенту
      user: { id: newUser._id, name: newUser.name, email: newUser.email },
    });
    
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'User registration failed' });
  }
});

router.get('/users',async(req,res)=>{
    const allUsers=await User.find()
    if(!allUsers) return res.status(400).json({
      message:'No users'
    })
    res.json({users:allUsers})
})
router.post('/login', async (req, res) => {

  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    console.log('user', Boolean(user))
    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, {
        expiresIn: '1h',
      });
      console.log("user",user);
      
      res.json({ token });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(400).json({ error: `loginFailed: ${error.message}` });
  }
});

router.put('/:id/make-admin', adminMiddleware,async (req, res) => {
  console.log('req',req.params);
  
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
   
      user.isAdmin = true;
      await user.save();
      console.log('makeAdmin: ',user.name);
      
      res.json({ message: 'User promoted to admin successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error updating user role', error });
    }
  });
  

  router.put('/:id/remove-admin', async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      user.isAdmin = false;
      await user.save();
      console.log('makeuser: ',user.name);
      res.json({ message: 'Admin rights removed successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error updating user role', error });
    }
  });
  

module.exports = router;
