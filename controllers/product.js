const productModel = require('../schemas/products');
const categoryModel = require('../schemas/category');

const baseUrl = 'http://localhost:3000/upload/';

module.exports = {
    getAllProducts: async function () {
        try {
            return await productModel.find({ isDeleted: false }).populate("category");
        } catch (error) {
            throw new Error('Không thể lấy danh sách sản phẩm: ' + error.message);
        }
    },

    getProductById: async function (id) {
        try {
            return await productModel.findOne({ _id: id, isDeleted: false });
        } catch (error) {
            throw new Error('Không thể lấy sản phẩm: ' + error.message);
        }
    },

    createProduct: async function (body, file) {
        try {
            const category = await categoryModel.findOne({ name: body.category.trim() });
            if (!category) {
                throw new Error("Category không tồn tại");
            }

            let urlImg = '';
            if (file) {
                urlImg = `${baseUrl}${file.filename}`;
            } else if (body.urlImg) {
                urlImg = body.urlImg.startsWith('http') ? body.urlImg : `${baseUrl}${body.urlImg}`;
            }

            const newProduct = new productModel({
                name: body.name,
                price: body.price,
                quantity: body.quantity,
                category: category._id,
                urlImg: urlImg,
            });

            await newProduct.save();
            return newProduct;
        } catch (error) {
            throw new Error('Không thể tạo sản phẩm: ' + error.message);
        }
    },

    updateProductById: async function (id, body) {
        try {
            let updatedInfo = {};

            if (body.name) updatedInfo.name = body.name;
            if (body.price) updatedInfo.price = body.price;
            if (body.quantity) updatedInfo.quantity = body.quantity;
            if (body.category) updatedInfo.category = body.category;
            if (body.urlImg) {
                updatedInfo.urlImg = body.urlImg.startsWith('http')
                    ? body.urlImg
                    : `${baseUrl}${body.urlImg}`;
            }

            return await productModel.findByIdAndUpdate(id, updatedInfo, { new: true });
        } catch (error) {
            throw new Error('Không thể cập nhật sản phẩm: ' + error.message);
        }
    },

    DeleteProductById: async function (id) {
        try {
            return await productModel.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
        } catch (error) {
            throw new Error('Không thể xoá sản phẩm: ' + error.message);
        }
    }
};
