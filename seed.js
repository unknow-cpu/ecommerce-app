const mongoose = require('mongoose');
const Product = require('./models/Product');

mongoose.connect('mongodb://localhost:27017/eeshop', { useNewUrlParser: true, useUnifiedTopology: true });

const seedProducts = [
  {
    name: 'Product 1',
    description: 'This is a great product',
    price: 100,
    stock: 10,
    category: 'Category 1',
    image: 'image-url'
  },
  {
    name: 'Product 2',
    description: 'This is another great product',
    price: 150,
    stock: 20,
    category: 'Category 2',
    image: 'image-url-2'
  }
];

Product.insertMany(seedProducts)
  .then(() => {
    console.log('Seed Data Added');
    mongoose.connection.close();
  })
  .catch((err) => {
    console.error(err);
    mongoose.connection.close();
  });
