
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { UserModel } from './models/User';
import { ProductModel } from './models/Product';
import { OrderModel } from './models/Order';
import { ReviewModel } from './models/Review';

// Import routes
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import orderRoutes from './routes/orderRoutes';
import reviewRoutes from './routes/reviewRoutes';

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);

// Initialize database tables
const initDatabase = async () => {
  try {
    await UserModel.initTable();
    await ProductModel.initTable();
    await OrderModel.initTable();
    await ReviewModel.initTable();
    console.log('Database tables initialized');
  } catch (error) {
    console.error('Error initializing database tables:', error);
  }
};

// Start the server
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  
  // Initialize database tables on startup
  await initDatabase();
});
