require('dotenv').config();
const express = require('express');
const session = require('express-session')
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// Khởi tạo ứng dụng Express
const app = express();

// Middleware
app.use(bodyParser.json());

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' }
  }));


// Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));


// Import các route
const productRoutes = require('./routes/products');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');


// Sử dụng route
app.use('/api', productRoutes);
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', adminRoutes);
app.use('/api', shopRoutes);




app.get('/', (req, res) => {
    res.send('Welcome to the eCommerce API');
  });




// Khởi động server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
