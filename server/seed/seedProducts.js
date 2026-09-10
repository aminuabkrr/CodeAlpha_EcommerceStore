require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Product = require('../models/Product');

const sampleProducts = [
  {
    name: 'Aurora Wireless Earbuds',
    description: 'True wireless earbuds with active noise cancellation, 30-hour battery life via charging case, and IPX5 water resistance. Ideal for workouts and daily commutes.',
    price: 59.99,
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600',
    category: 'Electronics',
    stock: 45,
  },
  {
    name: 'Pulse Bluetooth Speaker',
    description: 'Portable speaker with 360-degree sound, 12-hour playtime, and rugged waterproof housing built for outdoor use.',
    price: 34.99,
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600',
    category: 'Electronics',
    stock: 60,
  },
  {
    name: 'Lumen Smart LED Desk Lamp',
    description: 'Adjustable brightness and color temperature desk lamp with USB charging port and touch controls.',
    price: 24.99,
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600',
    category: 'Electronics',
    stock: 80,
  },
  {
    name: 'Vantage 4K Action Camera',
    description: 'Compact action camera with 4K30fps video, waterproof case up to 30m, and image stabilization for smooth footage.',
    price: 89.99,
    image: 'https://images.unsplash.com/photo-1519183071298-a2962be96f83?w=600',
    category: 'Electronics',
    stock: 25,
  },
  {
    name: 'Classic Denim Jacket',
    description: 'Timeless mid-wash denim jacket with a relaxed fit, button front, and durable cotton construction.',
    price: 49.99,
    image: 'https://images.unsplash.com/photo-1601333144130-8cbb312386b6?w=600',
    category: 'Fashion',
    stock: 40,
  },
  {
    name: 'Everyday Crewneck Sweater',
    description: 'Soft cotton-blend crewneck sweater, machine washable, available in a versatile neutral tone.',
    price: 29.99,
    image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600',
    category: 'Fashion',
    stock: 70,
  },
  {
    name: 'Trailrunner Sneakers',
    description: 'Lightweight running sneakers with breathable mesh upper and cushioned sole for all-day comfort.',
    price: 64.99,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',
    category: 'Fashion',
    stock: 55,
  },
  {
    name: 'Heritage Leather Wallet',
    description: 'Slim bifold wallet crafted from genuine leather with RFID-blocking lining and six card slots.',
    price: 27.99,
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600',
    category: 'Accessories',
    stock: 65,
  },
  {
    name: 'Meridian Sunglasses',
    description: 'Polarized UV400 sunglasses with a lightweight acetate frame, available in a classic tortoiseshell finish.',
    price: 22.99,
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600',
    category: 'Accessories',
    stock: 90,
  },
  {
    name: 'Canvas Weekender Bag',
    description: 'Durable canvas duffel with leather trim, spacious main compartment, and adjustable shoulder strap.',
    price: 44.99,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600',
    category: 'Accessories',
    stock: 35,
  },
  {
    name: 'Cascade Ceramic Pour-Over Set',
    description: 'Hand-glazed ceramic pour-over coffee dripper with matching carafe, holds up to 4 cups.',
    price: 32.99,
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600',
    category: 'Home',
    stock: 50,
  },
  {
    name: 'Nimbus Weighted Throw Blanket',
    description: 'Breathable cotton-cover weighted blanket, 15 lbs, designed to improve sleep comfort.',
    price: 54.99,
    image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600',
    category: 'Home',
    stock: 30,
  },
  {
    name: 'Terra Ceramic Planter Set',
    description: 'Set of three minimalist ceramic planters in graduated sizes, includes drainage holes and saucers.',
    price: 26.99,
    image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600',
    category: 'Home',
    stock: 60,
  },
  {
    name: 'DriftKey Mechanical Keyboard',
    description: 'Compact 75% mechanical keyboard with hot-swappable switches, RGB backlighting, and USB-C connection.',
    price: 74.99,
    image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600',
    category: 'Computing',
    stock: 40,
  },
  {
    name: 'GlideTrack Wireless Mouse',
    description: 'Ergonomic wireless mouse with adjustable DPI, silent clicks, and up to 6 months of battery life.',
    price: 19.99,
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600',
    category: 'Computing',
    stock: 100,
  },
  {
    name: 'Summit 27" Monitor Stand',
    description: 'Adjustable aluminum monitor stand with built-in cable management, compatible with monitors up to 32 inches.',
    price: 39.99,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600',
    category: 'Computing',
    stock: 45,
  },
  {
    name: 'Portable SSD 1TB',
    description: 'Compact external solid-state drive with USB-C 3.2 interface, transfer speeds up to 1050MB/s.',
    price: 84.99,
    image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600',
    category: 'Computing',
    stock: 20,
  },
];

const seedDatabase = async () => {
  try {
    await connectDB();
    await Product.deleteMany();
    console.log('Existing products cleared');

    const created = await Product.insertMany(sampleProducts);
    console.log(`${created.length} products seeded successfully`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err.message);
    process.exit(1);
  }
};

seedDatabase();
