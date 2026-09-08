const Product = require('../models/Product');
const cloudinary = require('../config/cloudinary');

// @desc    Fetch all products with search, filter, pagination
// @route   GET /api/products
// @access  Private
const getProducts = async (req, res) => {
  const pageSize = Number(req.query.limit) || 10;
  const page = Number(req.query.page) || 1;
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: 'i' } },
          { sku: { $regex: req.query.search, $options: 'i' } },
          { category: { $regex: req.query.search, $options: 'i' } },
        ]
      }
    : {};

  const categoryFilter = req.query.category && req.query.category !== 'All' 
    ? { category: req.query.category } 
    : {};

  // Status logic mapping to stock
  let stockFilter = {};
  if (req.query.status && req.query.status !== 'All') {
    if (req.query.status === 'In Stock') {
      // For simplified filtering we might not have lowStockThreshold easily queryable like this directly if it varies, but we can do an aggregation or simple filter.
      // We will handle status on frontend mostly, but if we need to filter:
      stockFilter = { stock: { $gt: 0 } };
    } else if (req.query.status === 'Out of Stock') {
      stockFilter = { stock: 0 };
    } else if (req.query.status === 'Low Stock') {
      stockFilter = { $expr: { $and: [ { $gt: ["$stock", 0] }, { $lte: ["$stock", "$lowStockThreshold"] } ] } };
    }
  }

  const query = { ...keyword, ...categoryFilter, ...stockFilter };

  const count = await Product.countDocuments(query);
  const products = await Product.find(query)
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    success: true,
    data: {
      products,
      page,
      limit: pageSize,
      total: count,
      totalPages: Math.ceil(count / pageSize),
    }
  });
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Private
const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    res.json({ success: true, data: product });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  const { name, sku, description, category, price, stock, lowStockThreshold } = req.body;

  const productExists = await Product.findOne({ sku });
  if (productExists) {
    res.status(400);
    throw new Error('Product with this SKU already exists');
  }

  let image = {};
  if (req.file) {
    image = {
      url: req.file.path,
      publicId: req.file.filename,
    };
  }

  const product = new Product({
    name,
    sku,
    description,
    category,
    price,
    stock,
    lowStockThreshold,
    image,
  });

  const createdProduct = await product.save();
  res.status(201).json({ success: true, message: 'Product created successfully', data: createdProduct });
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  const { name, sku, description, category, price, lowStockThreshold } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    product.name = name || product.name;
    product.sku = sku || product.sku;
    product.description = description || product.description;
    product.category = category || product.category;
    product.price = price || product.price;
    product.lowStockThreshold = lowStockThreshold || product.lowStockThreshold;

    if (req.file) {
      // delete old image if exists
      if (product.image && product.image.publicId) {
        try {
          await cloudinary.uploader.destroy(product.image.publicId);
        } catch (error) {
          console.error("Failed to delete old image from Cloudinary", error);
        }
      }
      product.image = {
        url: req.file.path,
        publicId: req.file.filename,
      };
    }

    const updatedProduct = await product.save();
    res.json({ success: true, message: 'Product updated successfully', data: updatedProduct });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    if (product.image && product.image.publicId) {
      try {
        await cloudinary.uploader.destroy(product.image.publicId);
      } catch (error) {
        console.error("Failed to delete image from Cloudinary", error);
      }
    }
    await product.deleteOne();
    res.json({ success: true, message: 'Product deleted successfully' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
};

// @desc    Get low stock products
// @route   GET /api/products/low-stock/all
// @access  Private
const getLowStockProducts = async (req, res) => {
  const products = await Product.find({
    $expr: {
      $and: [
        { $gt: ["$stock", 0] },
        { $lte: ["$stock", "$lowStockThreshold"] }
      ]
    }
  });
  
  res.json({ success: true, data: products });
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStockProducts
};
