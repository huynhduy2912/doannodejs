const express = require('express');
const router = express.Router();
const upload = require('../utils/upload');
const { CreateSuccessRes } = require('../utils/responseHandler');
const { check_authentication, check_authorization } = require('../utils/check_auth');
const constants = require('../utils/constants');
const productController = require('../controllers/product');

router.get('/', async (req, res, next) => {
  try {
    const products = await productController.getAllProducts();
    CreateSuccessRes(res, products, 200);
  } catch (err) {
    next(err);
  }
});

router.get('/:id',
  check_authentication,
  check_authorization(constants.USER_PERMISSION),
  async (req, res, next) => {
    try {
      const product = await productController.getProductById(req.params.id);
      CreateSuccessRes(res, product, 200);
    } catch (err) {
      next(err);
    }
  }
);

router.post('/',
  check_authentication,
  check_authorization(constants.ADMIN_PERMISSION),
  upload.single('image'),
  async (req, res, next) => {
    try {
      const newProduct = await productController.createProduct(req.body, req.file);
      CreateSuccessRes(res, newProduct, 200);
    } catch (err) {
      next(err);
    }
  }
);

router.put('/:id',
  check_authentication,
  check_authorization(constants.MOD_PERMISSION),
  async (req, res, next) => {
    try {
      const updatedProduct = await productController.updateProductById(req.params.id, req.body);
      CreateSuccessRes(res, updatedProduct, 200);
    } catch (err) {
      next(err);
    }
  }
);

router.delete('/:id',
  check_authentication,
  check_authorization(constants.MOD_PERMISSION),
  async (req, res, next) => {
    try {
      const deletedProduct = await productController.DeleteProductById(req.params.id);
      CreateSuccessRes(res, deletedProduct, 200);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
