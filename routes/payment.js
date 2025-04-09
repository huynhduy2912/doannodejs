const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment');
const { CreateSuccessRes } = require('../utils/responseHandler');
const { check_authentication, check_authorization } = require('../utils/check_auth');
const constants = require('../utils/constants');


router.get('/', check_authentication, async (req, res, next) => {
    try {
        const userId = req.user._id;
        const payments = await paymentController.getAllPaymentsByUser(userId);
        const response = payments.map(payment => ({
            _id: payment._id,
            paymentAmount: payment.paymentAmount,
            paymentMethod: payment.paymentMethod,
            paymentStatus: payment.paymentStatus,
            createdAt: payment.createdAt,
            order: payment.orderSnapshot
        }));

        CreateSuccessRes(res, response, 200);
    } catch (err) {
        console.error("Lỗi khi lấy payment:", err.message);
        next(err);
    }
});



router.put('/:id', check_authentication,
    check_authorization(constants.MOD_PERMISSION), async (req, res, next) => {
        try {
            const { paymentStatus } = req.body;
            const updatedPayment = await paymentController.updatePaymentStatus(req.params.id, paymentStatus);
            CreateSuccessRes(res, updatedPayment, 200);
        } catch (err) {
            next(err);
        }
    });

module.exports = router;
