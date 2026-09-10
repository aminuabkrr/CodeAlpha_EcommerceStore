const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc   Create a new order from submitted cart items
// @route  POST /api/orders
const createOrder = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { items, deliveryInfo } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item',
      });
    }

    if (
      !deliveryInfo ||
      !deliveryInfo.fullName ||
      !deliveryInfo.address ||
      !deliveryInfo.city ||
      !deliveryInfo.postalCode ||
      !deliveryInfo.phone
    ) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Complete delivery information is required',
      });
    }

    const orderItems = [];
    let totalAmount = 0;

    // Validate stock and build order items using authoritative server-side data
    for (const item of items) {
      const product = await Product.findById(item.productId).session(session);

      if (!product) {
        await session.abortTransaction();
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.productId}`,
        });
      }

      const quantity = Number(item.quantity);

      if (!quantity || quantity < 1) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: `Invalid quantity for ${product.name}`,
        });
      }

      if (product.stock < quantity) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}`,
        });
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price, // server-side price, never trust client price
        quantity,
      });

      totalAmount += product.price * quantity;

      // Decrement stock
      product.stock -= quantity;
      await product.save({ session });
    }

    const order = await Order.create(
      [
        {
          user: req.user._id,
          items: orderItems,
          totalAmount,
          deliveryInfo,
          status: 'Pending',
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: order[0],
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    next(err);
  }
};

// @desc   Get orders for the current user (or all orders if admin + ?all=true)
// @route  GET /api/orders
const getOrders = async (req, res, next) => {
  try {
    const filter =
      req.user.role === 'admin' && req.query.all === 'true'
        ? {}
        : { user: req.user._id };

    const orders = await Order.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (err) {
    next(err);
  }
};

// @desc   Get a single order (owner or admin only)
// @route  GET /api/orders/:id
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    const isOwner = order.user._id.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied — this is not your order',
      });
    }

    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

// @desc   Update order status (admin only)
// @route  PUT /api/orders/:id/status
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    order.status = status;
    await order.save();

    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

module.exports = { createOrder, getOrders, getOrderById, updateOrderStatus };
