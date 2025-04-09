const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

let productModel = require('../schemas/products');
let categoryModel = require('../schemas/category');
let { CreateErrorRes, CreateSuccessRes } = require('../utils/responseHandler');
const { check_authentication, check_authorization } = require('../utils/check_auth');
const constants = require('../utils/constants');

// Cấu hình multer để lưu ảnh
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage: storage });

// GET tất cả sản phẩm
router.get('/',
  check_authentication,
  check_authorization(constants.USER_PERMISSION),
  async (req, res, next) => {
    let products = await productModel.find({ isDeleted: false }).populate("category");
    CreateSuccessRes(res, products, 200);
  }
);


// GET theo ID
router.get('/:id',
  check_authentication,
  check_authorization(constants.USER_PERMISSION),
  async (req, res, next) => {
    try {
      let product = await productModel.findOne({ _id: req.params.id, isDeleted: false });
      CreateSuccessRes(res, product, 200);
    } catch (error) {
      next(error);
    }
  }
);

router.post('/',
  check_authentication,
  check_authorization(constants.ADMIN_PERMISSION),
  upload.single('image'),
  async (req, res, next) => {
    try {
      const body = req.body;
      const file = req.file;

      const category = await categoryModel.findOne({ name: body.category.trim() });
      if (!category) {
        throw new Error("Category không tồn tại");
      }

      const newProduct = new productModel({
        name: body.name,
        price: body.price,
        quantity: body.quantity,
        category: category._id,
        urlImg: file ? `http://localhost:3000/upload/${file.filename}` : ""
      });

      await newProduct.save();
      CreateSuccessRes(res, newProduct, 200);
    } catch (error) {
      next(error);
    }
  }
);

router.put('/:id',
  check_authentication,
  check_authorization(constants.MOD_PERMISSION),
  async function (req, res, next) {
    try {
      let id = req.params.id;
      let body = req.body;
      let updatedInfo = {};

      if (body.name) updatedInfo.name = body.name;
      if (body.price) updatedInfo.price = body.price;
      if (body.quantity) updatedInfo.quantity = body.quantity;
      if (body.category) updatedInfo.category = body.category;

      if (body.urlImg) {
        if (!body.urlImg.startsWith('http')) {
          updatedInfo.urlImg = `http://localhost:3000/upload/${body.urlImg}`;
        } else {
          updatedInfo.urlImg = body.urlImg;
        }
      }

      let updateProduct = await productModel.findByIdAndUpdate(id, updatedInfo, { new: true });
      CreateSuccessRes(res, updateProduct, 200);
    } catch (error) {
      next(error);
    }
  });

router.delete('/:id',
  check_authentication,
  check_authorization(constants.MOD_PERMISSION),
  async (req, res, next) => {
    try {
      let id = req.params.id;
      let updateProduct = await productModel.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
      CreateSuccessRes(res, updateProduct, 200);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
