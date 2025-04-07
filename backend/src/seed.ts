
import dotenv from 'dotenv';
import { UserModel, User } from './models/User';
import { ProductModel, Product } from './models/Product';
import { OrderModel, Order } from './models/Order';
import { ReviewModel, Review } from './models/Review';
import crypto from 'crypto';

// Load environment variables
dotenv.config();

// Hash passwords
const hashPassword = (password: string): string => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

const seed = async () => {
  try {
    console.log('Initializing database tables...');
    await UserModel.initTable();
    await ProductModel.initTable();
    await OrderModel.initTable();
    await ReviewModel.initTable();
    
    console.log('Seeding users...');
    // Create sample users
    const users: User[] = [
      { 
        id: '1',
        name: 'John Customer', 
        email: 'customer@example.com', 
        password: hashPassword('password'), 
        role: 'customer' 
      },
      { 
        id: '2',
        name: 'Jane Vendor', 
        email: 'vendor@example.com', 
        password: hashPassword('password'), 
        role: 'vendor' 
      },
      { 
        id: '3',
        name: 'Admin User', 
        email: 'admin@example.com', 
        password: hashPassword('password'), 
        role: 'admin' 
      }
    ];
    
    for (const user of users) {
      try {
        // Check if user already exists
        const existingUser = await UserModel.findByEmail(user.email);
        if (!existingUser) {
          await UserModel.create(user);
          console.log(`Created user: ${user.name}`);
        } else {
          console.log(`User ${user.email} already exists, skipping`);
        }
      } catch (error) {
        console.error(`Error creating user ${user.email}:`, error);
      }
    }
    
    console.log('Seeding products...');
    // Create sample products
    const products: Product[] = [
      {
        id: '1',
        name: 'Handmade Ceramic Bowl',
        description: 'Beautiful handcrafted ceramic bowl perfect for your kitchen.',
        price: 29.99,
        vendor_id: '2',
        vendor_name: 'Jane Vendor',
        category: 'pottery',
        images: ['/placeholder.svg'],
        rating: 4.5,
        review_count: 2,
        approved: true,
        featured: true,
        stock: 15
      },
      {
        id: '2',
        name: 'Wooden Cutting Board',
        description: 'Artisanal cutting board made from sustainable wood.',
        price: 49.99,
        vendor_id: '2',
        vendor_name: 'Jane Vendor',
        category: 'woodwork',
        images: ['/placeholder.svg'],
        rating: 5,
        review_count: 0,
        approved: true,
        featured: false,
        stock: 7
      },
      {
        id: '3',
        name: 'Handwoven Basket',
        description: 'Traditional handwoven basket using natural materials.',
        price: 34.99,
        vendor_id: '2',
        vendor_name: 'Jane Vendor',
        category: 'textiles',
        images: ['/placeholder.svg'],
        rating: 0,
        review_count: 0,
        approved: true,
        featured: false,
        stock: 10
      },
      {
        id: '4',
        name: 'Silver Pendant Necklace',
        description: 'Elegant hand-crafted silver pendant with intricate detailing.',
        price: 79.99,
        vendor_id: '2',
        vendor_name: 'Jane Vendor',
        category: 'jewelry',
        images: ['/placeholder.svg'],
        rating: 5,
        review_count: 1,
        approved: true,
        featured: true,
        stock: 5
      },
      {
        id: '5',
        name: 'Abstract Wall Art',
        description: 'Original abstract painting on canvas, perfect for modern homes.',
        price: 149.99,
        vendor_id: '2',
        vendor_name: 'Jane Vendor',
        category: 'art',
        images: ['/placeholder.svg'],
        rating: 0,
        review_count: 0,
        approved: true,
        featured: false,
        stock: 3
      },
      {
        id: '6',
        name: 'Macramé Plant Hanger',
        description: 'Handcrafted macramé plant hanger made with 100% cotton rope.',
        price: 19.99,
        vendor_id: '2',
        vendor_name: 'Jane Vendor',
        category: 'textiles',
        images: ['/placeholder.svg'],
        rating: 0,
        review_count: 0,
        approved: true,
        featured: false,
        stock: 20
      }
    ];
    
    for (const product of products) {
      try {
        const existingProduct = await ProductModel.getById(product.id!);
        if (!existingProduct) {
          await ProductModel.create(product);
          console.log(`Created product: ${product.name}`);
        } else {
          console.log(`Product ${product.name} already exists, skipping`);
        }
      } catch (error) {
        console.error(`Error creating product ${product.name}:`, error);
      }
    }
    
    console.log('Seeding orders...');
    // Create sample orders
    const orders: Order[] = [
      {
        id: '1',
        customer_id: '1',
        customer_name: 'John Customer',
        vendor_id: '2',
        vendor_name: 'Jane Vendor',
        products: [
          {
            product_id: '1',
            name: 'Handmade Ceramic Bowl',
            price: 29.99,
            quantity: 2
          }
        ],
        total: 59.98,
        status: 'delivered',
        shipping_address: '123 Main St, New York, NY 10001',
        payment_method: 'Credit Card'
      },
      {
        id: '2',
        customer_id: '1',
        customer_name: 'John Customer',
        vendor_id: '2',
        vendor_name: 'Jane Vendor',
        products: [
          {
            product_id: '4',
            name: 'Silver Pendant Necklace',
            price: 79.99,
            quantity: 1
          }
        ],
        total: 79.99,
        status: 'shipped',
        shipping_address: '123 Main St, New York, NY 10001',
        payment_method: 'PayPal'
      },
      {
        id: '3',
        customer_id: '1',
        customer_name: 'John Customer',
        vendor_id: '2',
        vendor_name: 'Jane Vendor',
        products: [
          {
            product_id: '2',
            name: 'Wooden Cutting Board',
            price: 49.99,
            quantity: 1
          },
          {
            product_id: '6',
            name: 'Macramé Plant Hanger',
            price: 19.99,
            quantity: 2
          }
        ],
        total: 89.97,
        status: 'pending',
        shipping_address: '123 Main St, New York, NY 10001',
        payment_method: 'Credit Card'
      }
    ];
    
    for (const order of orders) {
      try {
        // We can't easily check for existing orders by ID in this context
        // So we'll just create them and handle any errors
        await OrderModel.create(order);
        console.log(`Created order: ${order.id}`);
      } catch (error) {
        console.error(`Error creating order ${order.id}:`, error);
      }
    }
    
    console.log('Seeding reviews...');
    // Create sample reviews
    const reviews: Review[] = [
      {
        id: '1',
        product_id: '1',
        customer_id: '1',
        customer_name: 'John Customer',
        rating: 5,
        comment: 'Beautiful bowl! Excellent craftsmanship and arrived quickly.'
      },
      {
        id: '2',
        product_id: '1',
        customer_id: '3',
        customer_name: 'Sarah Johnson',
        rating: 4,
        comment: 'Lovely bowl, a bit smaller than I expected but great quality.'
      },
      {
        id: '3',
        product_id: '4',
        customer_id: '1',
        customer_name: 'John Customer',
        rating: 5,
        comment: 'Gorgeous pendant! Even more beautiful in person.'
      }
    ];
    
    for (const review of reviews) {
      try {
        await ReviewModel.create(review);
        console.log(`Created review for product: ${review.product_id}`);
      } catch (error) {
        console.error(`Error creating review for product ${review.product_id}:`, error);
      }
    }
    
    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed
seed();
