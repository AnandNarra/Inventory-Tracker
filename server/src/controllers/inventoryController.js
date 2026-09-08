const InventoryTransaction = require('../models/InventoryTransaction');
const Product = require('../models/Product');

// @desc    Update product stock
// @route   PATCH /api/products/:id/stock
// @access  Private/Admin
const updateStock = async (req, res) => {
  const { type, quantity, reason } = req.body;
  const qty = Number(quantity);

  if (!['IN', 'OUT'].includes(type) || qty <= 0) {
    res.status(400);
    throw new Error('Invalid stock update parameters');
  }

  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const previousStock = product.stock;
  let newStock;

  if (type === 'IN') {
    newStock = previousStock + qty;
  } else if (type === 'OUT') {
    if (qty > previousStock) {
      res.status(400);
      throw new Error(`Insufficient stock. Available stock is ${previousStock}.`);
    }
    newStock = previousStock - qty;
  }

  product.stock = newStock;
  await product.save();

  const transaction = new InventoryTransaction({
    productId: product._id,
    type,
    quantity: qty,
    previousStock,
    newStock,
    reason,
    createdBy: req.user._id,
  });

  await transaction.save();

  res.json({
    success: true,
    message: 'Stock updated successfully',
    data: {
      product,
      transaction
    }
  });
};

// @desc    Get all inventory transactions
// @route   GET /api/inventory/history
// @access  Private
const getInventoryHistory = async (req, res) => {
  const pageSize = Number(req.query.limit) || 10;
  const page = Number(req.query.page) || 1;
  const typeFilter = req.query.type && req.query.type !== 'All' ? { type: req.query.type === 'Stock In' ? 'IN' : 'OUT' } : {};

  // For searching by product name, we might need aggregation or populate filter.
  // We'll keep it simple for this demonstration and rely on basic populate and filter in memory if small, or complex aggregation if large.
  // Actually mongoose populate match is an option, but it filters child not parent.
  // We'll do a simple query and populate product details.

  const count = await InventoryTransaction.countDocuments(typeFilter);
  const transactions = await InventoryTransaction.find(typeFilter)
    .populate('productId', 'name sku image')
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    success: true,
    data: {
      transactions,
      page,
      limit: pageSize,
      total: count,
      totalPages: Math.ceil(count / pageSize),
    }
  });
};

// @desc    Get inventory history for specific product
// @route   GET /api/inventory/product/:productId
// @access  Private
const getProductInventoryHistory = async (req, res) => {
  const transactions = await InventoryTransaction.find({ productId: req.params.productId })
    .sort({ createdAt: -1 })
    .limit(10); // Last 10

  res.json({ success: true, data: transactions });
};

module.exports = {
  updateStock,
  getInventoryHistory,
  getProductInventoryHistory,
};
