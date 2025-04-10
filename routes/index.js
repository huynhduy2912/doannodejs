var express = require('express');
var router = express.Router();
const productModel = require('../schemas/products');

/* GET home page. */
router.get('/', async function (req, res, next) {
  // res.render('index', { title: 'Nodejs' });
  try {
    const products = await productModel.find({ isDeleted: false }).populate("category");
    res.render('index', { title: 'Danh sách sản phẩm', products });
  } catch (error) {
    next(error);
  }
});
router.get('/:id', async (req, res, next) => {
  try {
    const product = await productModel.findOne({ _id: req.params.id, isDeleted: false }).populate("category");
    if (!product) {
      return res.status(404).send("Sản phẩm không tồn tại!");
    }
    res.render('detail', {
      title: 'Chi tiết sản phẩm',
      product
    });
  } catch (error) {
    next(error);
  }
});
router.use('/products', require('./products'));
router.use('/categories', require('./categories'));
router.use('/cart', require('./cart'));
router.use('/order', require('./order'));
router.use('/payment', require('./payment'));
router.use('/upload', require('./upload'));

module.exports = router;
