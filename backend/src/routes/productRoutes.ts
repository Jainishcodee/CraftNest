
import express from 'express';
import {
  getAllProducts,
  getProductById,
  createProduct,
  approveProduct,
  getVendorProducts
} from '../controllers/productController';

const router = express.Router();

// Get all products
router.get('/', getAllProducts);

// Get product by ID
router.get('/:id', getProductById);

// Create new product
router.post('/', createProduct);

// Approve product
router.patch('/:id/approve', approveProduct);

// Get vendor products
router.get('/vendor/:vendorId', getVendorProducts);

export default router;
