require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');
const Product = require('./models/Product');

connectDB().then(async () => {
  const testProduct = await Product.create({
    name: 'Test Product',
    description: 'A temporary test product',
    price: 9.99,
    image: 'https://via.placeholder.com/300',
    category: 'Electronics',
    stock: 5,
  });
  console.log('Created test product:', testProduct);

  // Clean up
  await Product.deleteOne({ _id: testProduct._id });
  console.log('Test product removed — models are working correctly.');
  process.exit(0);
});
