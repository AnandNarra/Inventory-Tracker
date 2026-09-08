const express = require('express');
const router = express.Router();
const {
  getInventoryHistory,
  getProductInventoryHistory,
} = require('../controllers/inventoryController');
const { protect } = require('../middleware/authMiddleware');

const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

router.get('/history', protect, asyncHandler(getInventoryHistory));
router.get('/product/:productId', protect, asyncHandler(getProductInventoryHistory));

// Note: updateStock is on productRoutes /api/products/:id/stock

module.exports = router;
