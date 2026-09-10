const Product = require('../models/Product');

// @desc   Get all products (supports search, category filter, sort)
// @route  GET /api/products
const getProducts = async (req, res, next) => {
  try {
    const { search, category, sort } = req.query;
    const filter = {};

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    if (category) {
      filter.category = category;
    }

    let query = Product.find(filter);

    // Sorting options
    if (sort === 'price_asc') query = query.sort({ price: 1 });
    else if (sort === 'price_desc') query = query.sort({ price: -1 });
    else if (sort === 'newest') query = query.sort({ createdAt: -1 });
    else query = query.sort({ createdAt: -1 }); // default

    const products = await query;

    res.json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (err) {
    next(err);
  }
};

// @desc   Get a single product by id
// @route  GET /api/products/:id
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

// @desc   Create a product (admin only)
// @route  POST /api/products
const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, image, category, stock } = req.body;

    if (!name || !description || !price || !image || !category) {
      return res.status(400).json({
        success: false,
        message: 'Name, description, price, image, and category are required',
      });
    }

    const product = await Product.create({
      name,
      description,
      price,
      image,
      category,
      stock: stock ?? 0,
    });

    res.status(201).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

// @desc   Update a product (admin only)
// @route  PUT /api/products/:id
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const { name, description, price, image, category, stock } = req.body;

    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = price;
    if (image !== undefined) product.image = image;
    if (category !== undefined) product.category = category;
    if (stock !== undefined) product.stock = stock;

    const updated = await product.save();

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

// @desc   Delete a product (admin only)
// @route  DELETE /api/products/:id
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produ
