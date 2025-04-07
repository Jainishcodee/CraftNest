
import { Request, Response } from 'express';
import { UserModel, User, UserRole } from '../models/User';
import crypto from 'crypto';

// For a production app, use a proper password hashing library like bcrypt
const hashPassword = (password: string): string => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body;
    
    if (!email || !password || !role) {
      return res.status(400).json({ message: 'Email, password and role are required' });
    }
    
    const user = await UserModel.findByEmail(email);
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    if (user.role !== role) {
      return res.status(401).json({ message: 'Invalid role' });
    }
    
    const hashedPassword = hashPassword(password);
    if (user.password !== hashedPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // In a real app, you would use JWT tokens here
    // For simplicity, we'll just return the user without the password
    const { password: _, ...userWithoutPassword } = user;
    
    res.status(200).json({
      message: 'Login successful',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;
    
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Name, email, password, and role are required' });
    }
    
    // Validate role
    if (!['customer', 'vendor'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be customer or vendor' });
    }
    
    // Check if user already exists
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: 'Email already exists' });
    }
    
    // Hash the password
    const hashedPassword = hashPassword(password);
    
    // Create new user
    const newUser: User = {
      name,
      email, 
      password: hashedPassword,
      role: role as UserRole
    };
    
    const createdUser = await UserModel.create(newUser);
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = createdUser;
    
    res.status(201).json({
      message: 'Registration successful',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
