const mongoose = require('mongoose');
const { LaptopSchema, MobileSchema, TVSchema } = require('./models/Products'); // путь к вашей модели Laptop

const updateNetwork = async () => {
  try {
    await mongoose.connect('mongodb+srv://arazaraz777:braolgaas1900@cluster0.n4v9x.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');

    // Добавляем поле network для Laptop
    await LaptopSchema.updateMany(
      { network: { $exists: false } },  // Условие: если поле network не существует
      {
        $set: {
          network: 'Wi-Fi 5, Bluetooth 5.0' // Устанавливаем значение network
        }
      }
    );



    console.log('Network field updated successfully for all devices');
  } catch (error) {
    console.error('Error updating network field:', error);
  } finally {
    mongoose.connection.close();
  }
};

updateNetwork();