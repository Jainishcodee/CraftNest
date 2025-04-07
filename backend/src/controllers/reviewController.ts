
import { Request, Response } from 'express';
import { ReviewModel, Review } from '../models/Review';

export const getProductReviews = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const reviews = await ReviewModel.getByProductId(productId);
    res.status(200).json(reviews);
  } catch (error) {
    console.error('Error getting product reviews:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createReview = async (req: Request, res: Response) => {
  try {
    const { product_id, customer_id, customer_name, rating, comment } = req.body;
    
    if (!product_id || !customer_id || !customer_name || !rating || !comment) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }
    
    const newReview: Review = {
      product_id,
      customer_id,
      customer_name,
      rating,
      comment
    };
    
    const review = await ReviewModel.create(newReview);
    res.status(201).json(review);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
