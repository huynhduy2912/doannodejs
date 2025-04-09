const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categories');
const { CreateSuccessRes } = require('../utils/responseHandler');
const { check_authentication, check_authorization } = require('../utils/check_auth');
const constants = require('../utils/constants');
const Category = require('../schemas/category');

router.get('/', check_authentication, check_authorization(constants.USER_PERMISSION), async (req, res, next) => {
  try {
    const categories = await categoryController.getAllCategories();
    CreateSuccessRes(res, categories, 200);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', check_authentication, check_authorization(constants.USER_PERMISSION), async (req, res, next) => {
  try {
    const category = await categoryController.getCategoryById(req.params.id);
    CreateSuccessRes(res, category, 200);
  } catch (err) {
    next(err);
  }
});

router.post('/', check_authentication, check_authorization(constants.USER_PERMISSION), async (req, res, next) => {
  try {
    const category = await categoryController.createCategory(req.body);
    CreateSuccessRes(res, category, 200);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', check_authentication, check_authorization(constants.USER_PERMISSION), async (req, res, next) => {
  try {
    const category = await categoryController.updateCategory(req.params.id, req.body);
    CreateSuccessRes(res, category, 200);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', check_authentication, check_authorization(constants.ADMIN_PERMISSION), async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ success: false, message: 'Danh mục không tồn tại' });
    }

    CreateSuccessRes(res, category, 200);
  } catch (err) {
    next(err);
  }
});


module.exports = router;
