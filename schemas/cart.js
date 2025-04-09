const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cartSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user', required: false
    },
    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'product', required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: 1
            },
            isDeleted: { type: Boolean, default: false }
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);
