const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

router.post('/', protect, createOrder);
router.get('/', protect, getOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/status', protect, admin, updateOrderStatus);

module.exports = router;
