const orderModel = require('../schemas/order');
const productModel = require('../schemas/products');
const paymentModel = require('../schemas/payment');

module.exports = {
    createOrder: async function (userId, items) {
        try {
            let totalAmount = 0;

            const populatedItems = [];

            for (let item of items) {
                const product = await productModel.findById(item.product);
                if (!product) throw new Error(`Sản phẩm với ID ${item.product} không tồn tại`);

                totalAmount += product.price * item.quantity;
                populatedItems.push({
                    product: {
                        _id: product._id,
                        name: product.name,
                        price: product.price,
                        description: product.description,
                        urlImg: product.urlImg
                    },
                    quantity: item.quantity
                });
            }
            const newOrder = new orderModel({
                userId,
                items,
                totalAmount
            });

            const savedOrder = await newOrder.save();
            const newPayment = new paymentModel({
                orderId: savedOrder._id,
                userId,
                paymentAmount: totalAmount,
                paymentMethod: 'truc_tiep',
                paymentStatus: 'pending',
                orderSnapshot: {
                    _id: savedOrder._id,
                    items: populatedItems,
                    totalAmount,
                    createdAt: savedOrder.createdAt
                }
            });

            await newPayment.save();
            await orderModel.findByIdAndDelete(savedOrder._id);
            return newPayment;
        } catch (error) {
            throw new Error(error.message);
        }
    },

    getAllOrdersByUser: async function (userId) {
        return await orderModel.find({ userId, isDeleted: false }).populate('items.product');
    },

    getOrderById: async function (id) {
        return await orderModel.findOne({ _id: id, isDeleted: false }).populate('items.product');
    },

    updateOrderStatus: async function (id, status) {
        return await orderModel.findByIdAndUpdate(id, { status }, { new: true });
    },

    deleteOrder: async function (orderId) {
        try {
            const order = await orderModel.findById(orderId);
            if (!order) throw new Error('Đơn hàng không tồn tại');

            order.isDeleted = true;
            await order.save();

            return order;
        } catch (error) {
            throw new Error(error.message);
        }
    }


};
