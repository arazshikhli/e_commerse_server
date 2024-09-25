require('dotenv').config(); // Если используете переменные окружения
const mongoose = require('mongoose');
const User = require('./models/Users.js'); // Подключение модели User

// Подключение к базе данныхS
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: false,
  useUnifiedTopology: false,
}).then(() => {
  console.log('Connected to MongoDB');
  createAdmin();
}).catch((err) => {
  console.error('Error connecting to MongoDB:', err);
});

// Функция для создания администратора
const createAdmin = async () => {
  const adminExists = await User.findOne({ isAdmin: true });
  
  if (!adminExists) {
    const adminUser = new User({
      name: 'Admin',
      email: 'arazaraz777@gmail.com',
      password: 'braolgaas1900', // Пароль лучше хешировать
      isAdmin: true,
    });
    await adminUser.save();
    console.log('Admin user created');
  } else {
    console.log('Admin user already exists');
  }

  mongoose.connection.close(); // Закрытие подключения после завершения
};
