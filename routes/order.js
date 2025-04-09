const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order');
const cartController = require('../controllers/cart');
let productModel = require('../schemas/products');
const { CreateSuccessRes } = require('../utils/responseHandler');
const { check_authentication, check_authorization } = require('../utils/check_auth');
const constants = require('../utils/constants');
let paymentController = require('../controllers/payment');

router.post('/',
    check_authentication,
    check_authorization(constants.USER_PERMISSION),
    async (req, res, next) => {
        try {
            const userId = req.user._id;
            const cart = await cartController.getCartByUserId(userId);

            if (!cart || cart.items.length === 0) {
                throw new Error('Giỏ hàng rỗng');
            }
            const items = cart.items.map(item => ({
                product: item.product._id || item.product,
                quantity: item.quantity
            }));
            const totalAmount = cart.items.reduce((sum, item) => {
                return sum + (item.product.price * item.quantity);
            }, 0);

            const newOrder = await orderController.createOrder(userId, items);
            console.log("items,totalAmount,newOrder", items, totalAmount, newOrder);
            const newPayment = await paymentController.createPayment(
                newOrder._id,
                userId,
                totalAmount,
                'truc_tiep'
            );
            for (const item of items) {
                await cartController.deleteCart(userId, item.product);
            }
            const orderWithPayment = newOrder.toObject();
            orderWithPayment.paymentMethod = newPayment.paymentMethod;
            CreateSuccessRes(res, orderWithPayment, 200);
        } catch (err) {
            next(err);
        }
    }
);

router.post('/:id',
    check_authentication,
    async (req, res, next) => {
        try {
            const userId = req.user._id;
            const productId = req.params.id;
            const { quantity } = req.body;

            if (!quantity || quantity <= 0) {
                throw new Error("Số lượng không hợp lệ");
            }

            const product = await productModel.findById(productId);
            if (!product) {
                throw new Error("Sản phẩm không tồn tại");
            }
            const item = {
                product: productId,
                quantity: quantity
            };

            const newOrder = await orderController.createOrder(userId, [item]);

            const newPayment = await paymentController.createPayment(
                newOrder._id,
                userId,
                product.price * quantity,
                'truc_tiep'
            );

            const orderWithPayment = newOrder.toObject();
            orderWithPayment.paymentMethod = newPayment.paymentMethod;

            CreateSuccessRes(res, orderWithPayment, 200);
        } catch (err) {
            next(err);
        }
    }
);


router.get('/',
    check_authentication,
    async (req, res, next) => {
        try {
            const user = req.user;
            const orders = await orderController.getAllOrdersByUser(user._id);
            CreateSuccessRes(res, orders, 200);
        } catch (err) {
            next(err);
        }
    });


router.get('/:id',
    check_authentication,
    check_authorization(constants.USER_PERMISSION),
    async (req, res, next) => {
        try {
            const order = await orderController.getOrderById(req.params.id);

            if (!order || order.isDeleted) {
                throw new Error("Đơn hàng không tồn tại");
            }

            const requestingUser = req.user;
            const isOwner = requestingUser._id == order.userId.toString();
            const isAdmin = constants.ADMIN_PERMISSION.includes(requestingUser.role.name);

            if (isOwner || isAdmin) {
                CreateSuccessRes(res, order, 200);
            } else {
                throw new Error("Bạn không có quyền xem đơn hàng này");
            }
        } catch (err) {
            next(err);
        }
    });


router.put('/:id',
    check_authentication,
    check_authorization(constants.MOD_PERMISSION),
    async (req, res, next) => {
        try {
            const { status } = req.body;
            const updatedOrder = await orderController.updateOrderStatus(req.params.id, status);
            CreateSuccessRes(res, updatedOrder, 200);
        } catch (err) {
            next(err);
        }
    });

router.delete('/:id', check_authentication, async (req, res, next) => {
    try {
        const result = await orderController.deleteOrder(req.params.id);
        res.status(200).json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
