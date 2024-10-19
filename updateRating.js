
const mongoose = require('mongoose');
const {LaptopSchema,MobileSchema,TVSchema} = require('./models/Products'); // путь к вашей модели Laptop

const updateRatings = async () => {
  await mongoose.connect('mongodb+srv://arazaraz777:braolgaas1900@cluster0.n4v9x.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  await LaptopSchema.updateMany(
    { rating: { $exists: false } },
    {
      $set: {
        rating: {
          average: 0,
          ratingsSum: 0,
          totalRatings: 0,
        },
      },
    }
  );
  await TVSchema.updateMany(
    { rating: { $exists: false } },
    {
      $set: {
        rating: {
          average: 0,
          ratingsSum: 0,
          totalRatings: 0,
        },
      },
    }
  );
  await MobileSchema.updateMany(
    { rating: { $exists: false } },
    {
      $set: {
        rating: {
          average: 0,
          ratingsSum: 0,
          totalRatings: 0,
        },
      },
    }
  );

  console.log('Ratings updated successfully');
  mongoose.connection.close();
};

updateRatings();
