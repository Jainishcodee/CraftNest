
import React, { createContext, useState, useContext, ReactNode } from 'react';

// Define product category
export type ProductCategory = 'pottery' | 'jewelry' | 'woodwork' | 'textiles' | 'art' | 'other';

// Define product interface
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  vendorId: string;
  vendorName: string;
  category: ProductCategory;
  images: string[];
  rating: number;
  reviewCount: number;
  approved: boolean;
  featured: boolean;
  stock: number;
  createdAt: Date;
}

// Define order status
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

// Define order interface
export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  vendorId: string;
  vendorName: string;
  products: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  total: number;
  status: OrderStatus;
  shippingAddress: string;
  paymentMethod: string;
  createdAt: Date;
  updatedAt: Date;
}

// Define review interface
export interface Review {
  id: string;
  productId: string;
  customerId: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

// Sample products data
const SAMPLE_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Handmade Ceramic Bowl',
    description: 'Beautiful handcrafted ceramic bowl perfect for your kitchen.',
    price: 29.99,
    vendorId: '2',
    vendorName: 'Jane Vendor',
    category: 'pottery',
    images: ['/placeholder.svg'],
    rating: 4.5,
    reviewCount: 12,
    approved: true,
    featured: true,
    stock: 15,
    createdAt: new Date('2023-05-15')
  },
  {
    id: '2',
    name: 'Wooden Cutting Board',
    description: 'Artisanal cutting board made from sustainable wood.',
    price: 49.99,
    vendorId: '2',
    vendorName: 'Jane Vendor',
    category: 'woodwork',
    images: ['/placeholder.svg'],
    rating: 5,
    reviewCount: 8,
    approved: true,
    featured: false,
    stock: 7,
    createdAt: new Date('2023-04-10')
  },
  {
    id: '3',
    name: 'Handwoven Basket',
    description: 'Traditional handwoven basket using natural materials.',
    price: 34.99,
    vendorId: '2',
    vendorName: 'Jane Vendor',
    category: 'textiles',
    images: ['/placeholder.svg'],
    rating: 4.2,
    reviewCount: 5,
    approved: true,
    featured: false,
    stock: 10,
    createdAt: new Date('2023-06-20')
  },
  {
    id: '4',
    name: 'Silver Pendant Necklace',
    description: 'Elegant hand-crafted silver pendant with intricate detailing.',
    price: 79.99,
    vendorId: '2',
    vendorName: 'Jane Vendor',
    category: 'jewelry',
    images: ['/placeholder.svg'],
    rating: 4.8,
    reviewCount: 15,
    approved: true,
    featured: true,
    stock: 5,
    createdAt: new Date('2023-03-10')
  },
  {
    id: '5',
    name: 'Abstract Wall Art',
    description: 'Original abstract painting on canvas, perfect for modern homes.',
    price: 149.99,
    vendorId: '2',
    vendorName: 'Jane Vendor',
    category: 'art',
    images: ['/placeholder.svg'],
    rating: 4.7,
    reviewCount: 6,
    approved: true,
    featured: false,
    stock: 3,
    createdAt: new Date('2023-07-05')
  },
  {
    id: '6',
    name: 'Macramé Plant Hanger',
    description: 'Handcrafted macramé plant hanger made with 100% cotton rope.',
    price: 19.99,
    vendorId: '2',
    vendorName: 'Jane Vendor',
    category: 'textiles',
    images: ['/placeholder.svg'],
    rating: 4.4,
    reviewCount: 9,
    approved: true,
    featured: false,
    stock: 20,
    createdAt: new Date('2023-05-25')
  }
];

// Sample orders data
const SAMPLE_ORDERS: Order[] = [
  {
    id: '1',
    customerId: '1',
    customerName: 'John Customer',
    vendorId: '2',
    vendorName: 'Jane Vendor',
    products: [
      {
        productId: '1',
        name: 'Handmade Ceramic Bowl',
        price: 29.99,
        quantity: 2
      }
    ],
    total: 59.98,
    status: 'delivered',
    shippingAddress: '123 Main St, New York, NY 10001',
    paymentMethod: 'Credit Card',
    createdAt: new Date('2023-06-10'),
    updatedAt: new Date('2023-06-15')
  },
  {
    id: '2',
    customerId: '1',
    customerName: 'John Customer',
    vendorId: '2',
    vendorName: 'Jane Vendor',
    products: [
      {
        productId: '4',
        name: 'Silver Pendant Necklace',
        price: 79.99,
        quantity: 1
      }
    ],
    total: 79.99,
    status: 'shipped',
    shippingAddress: '123 Main St, New York, NY 10001',
    paymentMethod: 'PayPal',
    createdAt: new Date('2023-07-01'),
    updatedAt: new Date('2023-07-03')
  },
  {
    id: '3',
    customerId: '1',
    customerName: 'John Customer',
    vendorId: '2',
    vendorName: 'Jane Vendor',
    products: [
      {
        productId: '2',
        name: 'Wooden Cutting Board',
        price: 49.99,
        quantity: 1
      },
      {
        productId: '6',
        name: 'Macramé Plant Hanger',
        price: 19.99,
        quantity: 2
      }
    ],
    total: 89.97,
    status: 'pending',
    shippingAddress: '123 Main St, New York, NY 10001',
    paymentMethod: 'Credit Card',
    createdAt: new Date('2023-07-10'),
    updatedAt: new Date('2023-07-10')
  }
];

// Sample reviews data
const SAMPLE_REVIEWS: Review[] = [
  {
    id: '1',
    productId: '1',
    customerId: '1',
    customerName: 'John Customer',
    rating: 5,
    comment: 'Beautiful bowl! Excellent craftsmanship and arrived quickly.',
    createdAt: new Date('2023-06-20')
  },
  {
    id: '2',
    productId: '1',
    customerId: '3',
    customerName: 'Sarah Johnson',
    rating: 4,
    comment: 'Lovely bowl, a bit smaller than I expected but great quality.',
    createdAt: new Date('2023-06-25')
  },
  {
    id: '3',
    productId: '4',
    customerId: '1',
    customerName: 'John Customer',
    rating: 5,
    comment: 'Gorgeous pendant! Even more beautiful in person.',
    createdAt: new Date('2023-07-05')
  }
];

// Define data context interface
interface DataContextType {
  products: Product[];
  orders: Order[];
  reviews: Review[];
  addProduct: (product: Omit<Product, 'id' | 'approved' | 'createdAt'>) => Promise<void>;
  approveProduct: (productId: string) => Promise<void>;
  addToCart: (product: Product, quantity: number) => void;
  cart: { product: Product; quantity: number }[];
  clearCart: () => void;
  createOrder: (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  addReview: (review: Omit<Review, 'id' | 'createdAt'>) => Promise<void>;
}

// Create the data context
const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(SAMPLE_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>(SAMPLE_ORDERS);
  const [reviews, setReviews] = useState<Review[]>(SAMPLE_REVIEWS);
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);

  // Add new product
  const addProduct = async (product: Omit<Product, 'id' | 'approved' | 'createdAt'>) => {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    
    const newProduct: Product = {
      ...product,
      id: String(Date.now()),
      approved: false, // Admin needs to approve
      createdAt: new Date(),
    };
    
    setProducts(prev => [...prev, newProduct]);
  };

  // Approve product
  const approveProduct = async (productId: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    
    setProducts(prev =>
      prev.map(product =>
        product.id === productId ? { ...product, approved: true } : product
      )
    );
  };

  // Add product to cart
  const addToCart = (product: Product, quantity: number) => {
    const existingItem = cart.find(item => item.product.id === product.id);
    
    if (existingItem) {
      setCart(prev =>
        prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      );
    } else {
      setCart(prev => [...prev, { product, quantity }]);
    }
  };

  // Clear cart
  const clearCart = () => {
    setCart([]);
  };

  // Create new order
  const createOrder = async (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    
    const orderId = String(Date.now());
    const newOrder: Order = {
      ...order,
      id: orderId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setOrders(prev => [...prev, newOrder]);
    return orderId;
  };

  // Update order status
  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    
    setOrders(prev =>
      prev.map(order =>
        order.id === orderId
          ? { ...order, status, updatedAt: new Date() }
          : order
      )
    );
  };

  // Add review
  const addReview = async (review: Omit<Review, 'id' | 'createdAt'>) => {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    
    const newReview: Review = {
      ...review,
      id: String(Date.now()),
      createdAt: new Date(),
    };
    
    setReviews(prev => [...prev, newReview]);
    
    // Update product rating
    const productReviews = [...reviews, newReview].filter(r => r.productId === review.productId);
    const avgRating = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;
    
    setProducts(prev =>
      prev.map(product =>
        product.id === review.productId
          ? { ...product, rating: avgRating, reviewCount: productReviews.length }
          : product
      )
    );
  };

  return (
    <DataContext.Provider
      value={{
        products,
        orders,
        reviews,
        addProduct,
        approveProduct,
        addToCart,
        cart,
        clearCart,
        createOrder,
        updateOrderStatus,
        addReview,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

// Custom hook for using data context
export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
