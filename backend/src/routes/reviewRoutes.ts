
import express from 'express';
import { getProductReviews, createReview } from '../controllers/reviewController';

const router = express.Router();

// Get product reviews
router.get('/product/:productId', getProductReviews);

// Create review
router.post('/', createReview);

export default router;
