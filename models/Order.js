const mongoose = require('mongoose');;


const OderProductSchema = new mongoose.Schema({
    productid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    priceWhenAddProduct: {
        type: Number,
        required: true,
        min: 0
    },
});
const OderSchema = new mongoose.Schema({
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    product: [OderProductSchema],
    shippingAddress: {
        type: String,
        required: true,
    },
    paymentstatus: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending'
    },
    shippingFee: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    note: String
    });

module.exports = mongoose.model('Oder', OderSchema);