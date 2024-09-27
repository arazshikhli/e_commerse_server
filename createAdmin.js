require('dotenv').config(); // Если используете переменные окружения
const mongoose = require('mongoose');
const User = require('./models/Users.js'); 


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
    const adminUser = new User({
      name: 'Admin',
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD, 
      isAdmin: true,
    });
    await adminUser.save();
    console.log('Admin user created');
  } else {
    console.log('Admin user already exists');
  }

  mongoose.connection.close(); // Закрытие подключения после завершения
};
