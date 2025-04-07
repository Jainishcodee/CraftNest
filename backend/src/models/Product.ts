
import pool from '../config/database';

export type ProductCategory = 'pottery' | 'jewelry' | 'woodwork' | 'textiles' | 'art' | 'other';

export interface Product {
  id?: string;
  name: string;
  description: string;
  price: number;
  vendor_id: string;
  vendor_name: string;
  category: ProductCategory;
  images: string[];
  rating?: number;
  review_count?: number;
  approved: boolean;
  featured: boolean;
  stock: number;
  created_at?: Date;
}

export class ProductModel {
  // Create tables if they don't exist
  static async initTable() {
    const connection = await pool.getConnection();
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS products (
          id VARCHAR(36) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT NOT NULL,
          price DECIMAL(10, 2) NOT NULL,
          vendor_id VARCHAR(36) NOT NULL,
          vendor_name VARCHAR(255) NOT NULL,
          category ENUM('pottery', 'jewelry', 'woodwork', 'textiles', 'art', 'other') NOT NULL,
          images JSON NOT NULL,
          rating DECIMAL(3, 2) DEFAULT 0,
          review_count INT DEFAULT 0,
          approved BOOLEAN DEFAULT FALSE,
          featured BOOLEAN DEFAULT FALSE,
          stock INT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (vendor_id) REFERENCES users(id)
        )
      `);
      console.log('Products table initialized');
    } catch (error) {
      console.error('Error initializing products table:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  // Get all products
  static async getAll(options?: { approved?: boolean }): Promise<Product[]> {
    const connection = await pool.getConnection();
    try {
      let query = 'SELECT * FROM products';
      const params = [];
      
      if (options?.approved !== undefined) {
        query += ' WHERE approved = ?';
        params.push(options.approved);
      }
      
      query += ' ORDER BY created_at DESC';
      
      const [rows] = await connection.query(query, params);
      const products = rows as any[];
      
      return products.map(product => ({
        ...product,
        images: JSON.parse(product.images),
        price: parseFloat(product.price),
        rating: parseFloat(product.rating)
      }));
    } catch (error) {
      console.error('Error getting all products:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  // Get product by ID
  static async getById(id: string): Promise<Product | null> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(
        'SELECT * FROM products WHERE id = ?',
        [id]
      );
      const products = rows as any[];
      
      if (products.length === 0) {
        return null;
      }
      
      const product = products[0];
      return {
        ...product,
        images: JSON.parse(product.images),
        price: parseFloat(product.price),
        rating: parseFloat(product.rating)
      };
    } catch (error) {
      console.error('Error getting product by id:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  // Create a new product
  static async create(product: Product): Promise<Product> {
    const connection = await pool.getConnection();
    try {
      const { name, description, price, vendor_id, vendor_name, category, images, approved, featured, stock } = product;
      const id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
      
      await connection.query(
        'INSERT INTO products (id, name, description, price, vendor_id, vendor_name, category, images, approved, featured, stock) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [id, name, description, price, vendor_id, vendor_name, category, JSON.stringify(images), approved, featured, stock]
      );
      
      return { ...product, id };
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  // Update product approval status
  static async updateApproval(id: string, approved: boolean): Promise<boolean> {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.query(
        'UPDATE products SET approved = ? WHERE id = ?',
        [approved, id]
      );
      
      return (result as any).affectedRows > 0;
    } catch (error) {
      console.error('Error updating product approval:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  // Get products by vendor ID
  static async getByVendorId(vendorId: string): Promise<Product[]> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(
        'SELECT * FROM products WHERE vendor_id = ? ORDER BY created_at DESC',
        [vendorId]
      );
      
      const products = rows as any[];
      
      return products.map(product => ({
        ...product,
        images: JSON.parse(product.images),
        price: parseFloat(product.price),
        rating: parseFloat(product.rating)
      }));
    } catch (error) {
      console.error('Error getting products by vendor id:', error);
      throw error;
    } finally {
      connection.release();
    }
  }
}
