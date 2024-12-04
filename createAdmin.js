require('dotenv').config(); 
const mongoose = require('mongoose');
const User = require('./models/Users.js'); 
const bcrypt = require('bcryptjs');

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: false,
  useUnifiedTopology: false,
}).then(() => {
  console.log('Connected to MongoDB');
  createAdmin();
}).catch((err) => {
  console.error('Error connecting to MongoDB:', err);
});

const createAdmin = async () => {
  const adminExists = await User.findOne({ isAdmin: true });
  
  if (!adminExists) {
    const password='admin123'
    const salt=await bcrypt.genSalt(10);
    const hashedPassword= bcrypt.hashSync(password,salt)
    const adminUser = new User({
      name: 'Admin',
      email: "admin@gmail.com",
      password: hashedPassword, 
      isAdmin: true,
    });
    await adminUser.save();
    console.log('Admin user created');
  } else {
    console.log('Admin user already exists');
  }

  mongoose.connection.close(); // Закрытие подключения после завершения
};
