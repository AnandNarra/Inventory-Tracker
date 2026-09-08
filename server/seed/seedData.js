const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../src/models/User');
const Product = require('../src/models/Product');
const InventoryTransaction = require('../src/models/InventoryTransaction');
const connectDB = require('../src/config/db');

dotenv.config();

connectDB();

const importData = async () => {
  try {
    await InventoryTransaction.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    const createdUsers = await User.create([{
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'Admin@123',
      role: 'admin'
    }]);

    const adminUser = createdUsers[0]._id;

    const sampleProducts = [
      {
        name: 'iPhone 15',
        sku: 'IPHONE-15',
        description: 'Apple iPhone 15',
        category: 'Electronics',
        price: 69999,
        stock: 25,
        lowStockThreshold: 5,
        image: { url: '', publicId: '' }
      },
      {
        name: 'MacBook Air',
        sku: 'MAC-AIR',
        description: 'Apple MacBook Air M2',
        category: 'Electronics',
        price: 99999,
        stock: 3,
        lowStockThreshold: 5,
        image: { url: '', publicId: '' }
      },
      {
        name: 'AirPods Pro',
        sku: 'AIRPODS-PRO',
        description: 'Apple AirPods Pro',
        category: 'Audio',
        price: 14999,
        stock: 0,
        lowStockThreshold: 5,
        image: { url: '', publicId: '' }
      },
      {
        name: 'Logitech Mouse',
        sku: 'LOGI-M',
        description: 'Logitech Wireless Mouse',
        category: 'Accessories',
        price: 2499,
        stock: 50,
        lowStockThreshold: 10,
        image: { url: '', publicId: '' }
      },
      {
        name: 'Mechanical Keyboard',
        sku: 'MECH-K',
        description: 'RGB Mechanical Keyboard',
        category: 'Accessories',
        price: 4999,
        stock: 4,
        lowStockThreshold: 5,
        image: { url: '', publicId: '' }
      }
    ];

    const insertedProducts = await Product.insertMany(sampleProducts);

    // Create sample transaction for first product
    await InventoryTransaction.create({
      productId: insertedProducts[0]._id,
      type: 'IN',
      quantity: 25,
      previousStock: 0,
      newStock: 25,
      reason: 'Initial Stock',
      createdBy: adminUser,
    });

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

importData();
