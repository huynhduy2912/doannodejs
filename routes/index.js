var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.use('/products', require('./products'));
router.use('/categories', require('./categories'));
router.use('/cart', require('./cart'));
router.use('/order', require('./order'));
router.use('/payment', require('./payment'));
router.use('/upload', require('./upload'));

module.exports = router;
