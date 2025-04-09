const Payment = require('../schemas/payment');
const orderModel = require('../schemas/order');

module.exports = {

    createPayment: async function ({ orderId, userId, paymentAmount, paymentMethod = 'truc_tiep' }) {
        try {
            const order = await orderModel.findById(orderId).populate('items.product');

            if (!order) {
                throw new Error("Không tìm thấy đơn hàng để tạo thanh toán.");
            }

            const payment = new Payment({
                orderId,
                userId,
                paymentAmount,
                paymentMethod,
                paymentStatus: 'pending',
                orderSnapshot: order.toObject()
            });

            await payment.save();

            // Đánh dấu đơn hàng đã bị xoá, không xoá thật sự
            order.isDeleted = true;
            await order.save();

            return payment;
        } catch (error) {
            throw new Error('Không thể tạo thanh toán: ' + error.message);
        }
    },


    getAllPaymentsByUser: async function (userId) {
        try {
            return await Payment.find({ userId });
        } catch (error) {
            throw new Error('Không thể lấy thanh toán: ' + error.message);
        }
    },

    updatePaymentStatus: async (id, paymentStatus) => {
        const updated = await Payment.findByIdAndUpdate(
            id,
            { paymentStatus },
            { new: true }
        );
        return updated;
    }
};
