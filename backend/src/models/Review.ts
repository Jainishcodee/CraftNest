
import pool from '../config/database';

export interface Review {
  id?: string;
  product_id: string;
  customer_id: string;
  customer_name: string;
  rating: number;
  comment: string;
  created_at?: Date;
}

export class ReviewModel {
  // Create tables if they don't exist
  static async initTable() {
    const connection = await pool.getConnection();
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS reviews (
          id VARCHAR(36) PRIMARY KEY,
          product_id VARCHAR(36) NOT NULL,
          customer_id VARCHAR(36) NOT NULL,
          customer_name VARCHAR(255) NOT NULL,
          rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
          comment TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (product_id) REFERENCES products(id),
          FOREIGN KEY (customer_id) REFERENCES users(id)
        )
      `);
      console.log('Reviews table initialized');
    } catch (error) {
      console.error('Error initializing reviews table:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  // Get reviews by product ID
  static async getByProductId(productId: string): Promise<Review[]> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(
        'SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC',
        [productId]
      );
      return rows as Review[];
    } catch (error) {
      console.error('Error getting reviews by product id:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  // Create a new review and update product rating
  static async create(review: Review): Promise<Review> {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      const { product_id, customer_id, customer_name, rating, comment } = review;
      const id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
      
      // Insert the review
      await connection.query(
        'INSERT INTO reviews (id, product_id, customer_id, customer_name, rating, comment) VALUES (?, ?, ?, ?, ?, ?)',
        [id, product_id, customer_id, customer_name, rating, comment]
      );
      
      // Calculate new average rating
      const [ratingRows] = await connection.query(
        'SELECT AVG(rating) as avg_rating, COUNT(*) as count FROM reviews WHERE product_id = ?',
        [product_id]
      );
      
      const ratingData = (ratingRows as any[])[0];
      
      // Update product rating and review count
      await connection.query(
        'UPDATE products SET rating = ?, review_count = ? WHERE id = ?',
        [ratingData.avg_rating, ratingData.count, product_id]
      );
      
      await connection.commit();
      
      return { ...review, id };
    } catch (error) {
      await connection.rollback();
      console.error('Error creating review:', error);
      throw error;
    } finally {
      connection.release();
    }
  }
}
