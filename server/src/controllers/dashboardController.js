const Product = require('../models/Product');
const InventoryTransaction = require('../models/InventoryTransaction');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard
// @access  Private
const getDashboardStats = async (req, res) => {
  const totalProducts = await Product.countDocuments();
  
  const products = await Product.find({});
  let totalStock = 0;
  let lowStockProducts = 0;
  let outOfStockProducts = 0;

  products.forEach(p => {
    totalStock += p.stock;
    if (p.stock === 0) {
      outOfStockProducts++;
    } else if (p.stock <= p.lowStockThreshold) {
      lowStockProducts++;
    }
  });

  const recentTransactions = await InventoryTransaction.find({})
    .populate('productId', 'name sku')
    .sort({ createdAt: -1 })
    .limit(5);

  const lowStockItems = await Product.find({
    $expr: {
      $and: [
        { $gt: ["$stock", 0] },
        { $lte: ["$stock", "$lowStockThreshold"] }
      ]
    }
  }).limit(5);

  res.json({
    success: true,
    data: {
      totalProducts,
      totalStock,
      lowStockProducts,
      outOfStockProducts,
      recentTransactions,
      lowStockItems
    }
  });
};

module.exports = {
  getDashboardStats,
};
