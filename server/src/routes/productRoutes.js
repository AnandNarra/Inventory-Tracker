const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

router.route('/')
  .get(protect, asyncHandler(getProducts))
  .post(protect, admin, upload.single('image'), asyncHandler(createProduct));

router.get('/low-stock', protect, asyncHandler(getLowStockProducts));

router.route('/:id')
  .get(protect, asyncHandler(getProductById))
  .put(protect, admin, upload.single('image'), asyncHandler(updateProduct))
  .delete(protect, admin, asyncHandler(deleteProduct));

const { updateStock } = require('../controllers/inventoryController');

router.route('/:id/stock')
  .patch(protect, admin, asyncHandler(updateStock));

module.exports = router;
