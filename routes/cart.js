const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart');
const { CreateSuccessRes } = require('../utils/responseHandler');
const { check_authentication, check_authorization } = require('../utils/check_auth');
const constants = require('../utils/constants');

router.get('/',
    check_authentication,
    check_authorization(constants.USER_PERMISSION),
    async (req, res, next) => {
        try {
            const userId = req.user._id;

            const cart = await cartController.getCartByUserId(userId);

            CreateSuccessRes(res, cart, 200);
        } catch (err) {
            next(err);
        }
    }
);

router.get('/:userId',
    check_authentication,
    check_authorization(constants.USER_PERMISSION),
    async (req, res, next) => {
        try {
            const requestingUser = req.user;
            const requestedUserId = req.params.userId;

            if (requestingUser._id.toString() === requestedUserId) {
                const cart = await cartController.getCartByUserId(requestedUserId);
                CreateSuccessRes(res, cart, 200);
            } else {
                throw new Error("Bạn không có quyền xem giỏ hàng này");
            }
        } catch (err) {
            next(err);
        }
    }
);

router.post('/',
    check_authentication,
    check_authorization(constants.USER_PERMISSION),
    async (req, res, next) => {
        try {
            const userId = req.user._id;
            const { product, quantity } = req.body;
            console.log("product:quantity", userId, quantity);
            if (!product || !quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Thiếu product hoặc quantity | product: ${product}, quantity: ${quantity}`
                });
            }

            const updatedCart = await cartController.addToCart(userId, product, quantity);
            CreateSuccessRes(res, updatedCart, 200);
        } catch (err) {
            next(err);
        }
    }
);



router.put('/',
    check_authentication,
    check_authorization(constants.USER_PERMISSION),
    async (req, res, next) => {
        try {
            const { userId, product, quantity } = req.body;
            const updatedCart = await cartController.updateCartItem(userId, product, quantity);
            CreateSuccessRes(res, updatedCart, 200);
        } catch (err) {
            next(err);
        }
    }
);

router.delete('/:productId',
    check_authentication,
    check_authorization(constants.USER_PERMISSION),
    async (req, res, next) => {
        try {
            const userId = req.user._id;
            const product = req.params.productId;
            console.log("userId, product", userId, product);

            const updatedCart = await cartController.deleteCart(userId, product);
            CreateSuccessRes(res, updatedCart, 200);
        } catch (err) {
            next(err);
        }
    }
);


module.exports = router;
