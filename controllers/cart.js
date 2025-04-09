const cartModel = require('../schemas/cart');
const productModel = require('../schemas/products');

module.exports = {
    getCartByUserId: async function (userId) {
        try {
            const cart = await cartModel.findOne({ userId }).populate('items.product');
            if (!cart) {
                throw new Error('Bạn chưa thêm sản phẩm vào giỏ hàng');
            }

            // Thêm domain vào đường dẫn ảnh
            const baseUrl = 'http://localhost:3000/uploads/';
            cart.items.forEach(item => {
                if (item.product && item.product.urlImg && !item.product.urlImg.startsWith('http')) {
                    item.product.urlImg = baseUrl + item.product.urlImg;
                }
            });

            return cart;
        } catch (error) {
            throw new Error(error.message);
        }
    },

    addToCart: async function (userId, productId, quantity) {
        try {
            const product = await productModel.findById(productId);
            if (!product) throw new Error('Sản phẩm không tồn tại');

            let cart = await cartModel.findOne({ userId });
            if (!cart) {
                cart = new cartModel({
                    userId,
                    items: [{ product: productId, quantity }]
                });
            } else {
                const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
                if (itemIndex >= 0) {
                    cart.items[itemIndex].quantity += quantity;
                } else {
                    cart.items.push({ product: productId, quantity });
                }
            }

            await cart.save();
            return await cart.populate('items.product');
        } catch (error) {
            throw new Error(error.message);
        }
    },

    updateCartItem: async function (userId, productId, quantity) {
        try {
            const cart = await cartModel.findOne({ userId });
            if (!cart) throw new Error('Giỏ hàng không tồn tại');

            const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
            if (itemIndex === -1) throw new Error('Sản phẩm không có trong giỏ hàng');

            cart.items[itemIndex].quantity = quantity;

            await cart.save();
            return await cart.populate('items.product');
        } catch (error) {
            throw new Error(error.message);
        }
    },

    deleteCart: async function (userId, productId) {
        try {
            const cart = await cartModel.findOne({ userId });
            if (!cart) throw new Error('Giỏ hàng không tồn tại');

            let found = false;

            cart.items = cart.items.map(item => {
                if (item.product.toString() === productId && !item.isDeleted) {
                    item.isDeleted = true;
                    found = true;
                }
                return item;
            });

            if (!found) throw new Error('Sản phẩm không có trong giỏ hàng hoặc đã bị xoá');

            await cart.save();

            const filteredItems = cart.items.filter(item => !item.isDeleted);

            return await cart.populate({
                path: 'items.product',
                match: { _id: { $in: filteredItems.map(i => i.product) } }
            });
        } catch (error) {
            throw new Error(error.message);
        }
    }

}
