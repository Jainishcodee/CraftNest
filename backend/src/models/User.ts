
import pool from '../config/database';

export type UserRole = 'customer' | 'vendor' | 'admin';

export interface User {
  id?: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  created_at?: Date;
}

export class UserModel {
  // Create tables if they don't exist
  static async initTable() {
    const connection = await pool.getConnection();
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(36) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          role ENUM('customer', 'vendor', 'admin') NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('Users table initialized');
    } catch (error) {
      console.error('Error initializing users table:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  // Find user by email
  static async findByEmail(email: string): Promise<User | null> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      const users = rows as User[];
      return users.length > 0 ? users[0] : null;
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  // Find user by ID
  static async findById(id: string): Promise<User | null> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(
        'SELECT * FROM users WHERE id = ?',
        [id]
      );
      const users = rows as User[];
      return users.length > 0 ? users[0] : null;
    } catch (error) {
      console.error('Error finding user by id:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  // Create a new user
  static async create(user: User): Promise<User> {
    const connection = await pool.getConnection();
    try {
      const { name, email, password, role } = user;
      const id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
      
      await connection.query(
        'INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
        [id, name, email, password, role]
      );
      
      return { ...user, id };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    } finally {
      connection.release();
    }
  }
}
