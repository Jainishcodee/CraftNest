import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { supabase, enableRealtimeSubscriptions } from '@/lib/supabase';
import { toast } from 'sonner';
import { productsAPI } from '@/services/api';

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
  loadingProducts: boolean;
}

// Create the data context
const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(true);
  
  // Fetch products on mount
  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        const { data, error } = await productsAPI.getAll(true); // Only get approved products
        
        if (error) {
          console.error('Error fetching products:', error);
          return;
        }
        
        if (data) {
          // Transform Supabase data to match our Product interface
          const transformedProducts: Product[] = data.map(item => ({
            id: item.id,
            name: item.name,
            description: item.description,
            price: parseFloat(item.price),
            vendorId: item.vendor_id,
            vendorName: item.vendor_name,
            category: item.category as ProductCategory,
            images: Array.isArray(item.images) ? item.images : [],
            rating: parseFloat(item.rating) || 0,
            reviewCount: item.review_count || 0,
            approved: item.approved,
            featured: item.featured,
            stock: item.stock,
            createdAt: new Date(item.created_at)
          }));
          
          setProducts(transformedProducts);
        }
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoadingProducts(false);
      }
    };
    
    fetchProducts();
    
    // Enable realtime subscriptions
    enableRealtimeSubscriptions();
    
    // Listen for product changes in real-time
    const productSubscription = supabase
      .channel('public:products')
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'products' }, 
          async (payload) => {
            console.log('Realtime product update:', payload);
            
            // If a product was inserted or updated
            if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
              const newProduct = payload.new;
              
              // Only add/update if the product is approved
              if (newProduct.approved) {
                // Refresh product list to ensure we have the latest data
                const { data, error } = await productsAPI.getAll(true);
                
                if (data && !error) {
                  const transformedProducts: Product[] = data.map(item => ({
                    id: item.id,
                    name: item.name,
                    description: item.description,
                    price: parseFloat(item.price),
                    vendorId: item.vendor_id,
                    vendorName: item.vendor_name,
                    category: item.category as ProductCategory,
                    images: Array.isArray(item.images) ? item.images : [],
                    rating: parseFloat(item.rating) || 0,
                    reviewCount: item.review_count || 0,
                    approved: item.approved,
                    featured: item.featured,
                    stock: item.stock,
                    createdAt: new Date(item.created_at)
                  }));
                  
                  setProducts(transformedProducts);
                  
                  // Show a toast notification for new products
                  if (payload.eventType === 'INSERT') {
                    toast.info('New product available!', {
                      description: `${newProduct.name} has been added to the store`
                    });
                  }
                }
              }
            }
            
            // If a product was deleted, remove it from state
            if (payload.eventType === 'DELETE') {
              const deletedProductId = payload.old.id;
              setProducts(prevProducts => 
                prevProducts.filter(p => p.id !== deletedProductId)
              );
            }
          })
      .subscribe();
    
    // Clean up the subscription when component unmounts
    return () => {
      supabase.removeChannel(productSubscription);
    };
  }, []);

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
        loadingProducts,
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
