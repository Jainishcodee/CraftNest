
import pool from '../config/database';

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderProduct {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id?: string;
  customer_id: string;
  customer_name: string;
  vendor_id: string;
  vendor_name: string;
  products: OrderProduct[];
  total: number;
  status: OrderStatus;
  shipping_address: string;
  payment_method: string;
  created_at?: Date;
  updated_at?: Date;
}

export class OrderModel {
  // Create tables if they don't exist
  static async initTable() {
    const connection = await pool.getConnection();
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS orders (
          id VARCHAR(36) PRIMARY KEY,
          customer_id VARCHAR(36) NOT NULL,
          customer_name VARCHAR(255) NOT NULL,
          vendor_id VARCHAR(36) NOT NULL,
          vendor_name VARCHAR(255) NOT NULL,
          products JSON NOT NULL,
          total DECIMAL(10, 2) NOT NULL,
          status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') NOT NULL DEFAULT 'pending',
          shipping_address TEXT NOT NULL,
          payment_method VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (customer_id) REFERENCES users(id),
          FOREIGN KEY (vendor_id) REFERENCES users(id)
        )
      `);
      console.log('Orders table initialized');
    } catch (error) {
      console.error('Error initializing orders table:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  // Get all orders
  static async getAll(): Promise<Order[]> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query('SELECT * FROM orders ORDER BY created_at DESC');
      const orders = rows as any[];
      
      return orders.map(order => ({
        ...order,
        products: JSON.parse(order.products),
        total: parseFloat(order.total)
      }));
    } catch (error) {
      console.error('Error getting all orders:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  // Get orders by customer ID
  static async getByCustomerId(customerId: string): Promise<Order[]> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(
        'SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC',
        [customerId]
      );
      
      const orders = rows as any[];
      
      return orders.map(order => ({
        ...order,
        products: JSON.parse(order.products),
        total: parseFloat(order.total)
      }));
    } catch (error) {
      console.error('Error getting orders by customer id:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  // Get orders by vendor ID
  static async getByVendorId(vendorId: string): Promise<Order[]> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(
        'SELECT * FROM orders WHERE vendor_id = ? ORDER BY created_at DESC',
        [vendorId]
      );
      
      const orders = rows as any[];
      
      return orders.map(order => ({
        ...order,
        products: JSON.parse(order.products),
        total: parseFloat(order.total)
      }));
    } catch (error) {
      console.error('Error getting orders by vendor id:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  // Create a new order
  static async create(order: Order): Promise<Order> {
    const connection = await pool.getConnection();
    try {
      const { customer_id, customer_name, vendor_id, vendor_name, products, total, status, shipping_address, payment_method } = order;
      const id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
      
      await connection.query(
        'INSERT INTO orders (id, customer_id, customer_name, vendor_id, vendor_name, products, total, status, shipping_address, payment_method) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [id, customer_id, customer_name, vendor_id, vendor_name, JSON.stringify(products), total, status, shipping_address, payment_method]
      );
      
      return { ...order, id };
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  // Update order status
  static async updateStatus(id: string, status: OrderStatus): Promise<boolean> {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.query(
        'UPDATE orders SET status = ? WHERE id = ?',
        [status, id]
      );
      
      return (result as any).affectedRows > 0;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    } finally {
      connection.release();
    }
  }
}
