const express = require('express');
const router = express.Router();
const User = require('../models/Users.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const adminMiddleware=require('../middleware/adminMiddleware.js')


// Функция для генерации access token
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, isAdmin: user.isAdmin },
    process.env.JWT_SECRET, 
    { expiresIn: '1h' } 
  );
};


const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET, 
    { expiresIn: '7d' } 
  );
};
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
 
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

   
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);


    const newUser = await User.create({
      name, email, password: password, isAdmin: false 
    });

    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);

    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: false });

    res.status(201).json({
      message: 'User registered',
      accessToken,
      refreshToken,
      user: { id: newUser._id, name: newUser.name, email: newUser.email },
    });
  } catch (error) {
    res.status(400).json({ error: 'User registration failed' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
console.log("Email",email);


  try {
    const user = await User.findOne({ email });
    console.log("user",user);
    
    if (!user) {
      console.log("not user");
      return res.status(401).json({ error: 'Invalid credentials' });
    }


    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (isPasswordCorrect) {
      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      res.cookie('refreshToken', refreshToken, { httpOnly: false, secure: false });
      res.json({ accessToken, refreshToken });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(400).json({ error: `loginFailed: ${error.message}` });
  }
});



router.get('/users',async(req,res)=>{
  const allUsers=await User.find()
  if(!allUsers) return res.status(400).json({
    message:'No users'
  })
  res.json({users:allUsers})
})


router.post('/refresh-token', (req, res) => {
  console.log('refres')
  const refreshToken = req.cookies.refreshToken; 

  if (!refreshToken) {
    return res.status(401).json({ error: 'No refresh token provided' });
  }


  jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid refresh token' });
    }

 
    const newAccessToken = generateAccessToken({ _id: user.id, email: user.email, isAdmin: user.isAdmin });
    res.json({ accessToken: newAccessToken });
  });
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
