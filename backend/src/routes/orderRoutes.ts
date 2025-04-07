
import express from 'express';
import {
  getAllOrders,
  getCustomerOrders,
  getVendorOrders,
  createOrder,
  updateOrderStatus
} from '../controllers/orderController';

const router = express.Router();

// Get all orders
router.get('/', getAllOrders);

// Get customer orders
router.get('/customer/:customerId', getCustomerOrders);

// Get vendor orders
router.get('/vendor/:vendorId', getVendorOrders);

// Create new order
router.post('/', createOrder);

// Update order status
router.patch('/:id/status', updateOrderStatus);

export default router;
