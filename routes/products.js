const express = require('express');
const { getAllProducts, getProductById, createProduct } = require('../controllers/productController');

const router = express.Router();

// Routes
router.get('/products', getAllProducts);
router.get('/products/:id', getProductById);
router.post('/createproducts', createProduct);

module.exports = router;
