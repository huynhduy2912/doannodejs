const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    paymentAmount: Number,
    paymentMethod: {
        type: String,
        default: 'truc_tiep'
    },
    paymentStatus: {
        type: String,
        default: 'pending'
    },
    orderSnapshot: {
        type: Object
    }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
