
import { supabase } from '@/lib/supabase';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Auth API
export const authAPI = {
  // Auth is now handled directly in AuthContext using Supabase client
  login: async () => {
    return { message: "Auth is now handled by Supabase client" };
  },
  
  register: async () => {
    return { message: "Auth is now handled by Supabase client" };
  },
};

// Products API
export const productsAPI = {
  getAll: async (approved?: boolean) => {
    try {
      let query = supabase.from('products').select('*');
      
      if (approved !== undefined) {
        query = query.eq('approved', approved);
      }
      
      const { data, error } = await query;
      
      if (error) {
        return { error: error.message };
      }
      
      return { data };
    } catch (error) {
      console.error('API Error:', error);
      return {
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  },

  getById: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        return { error: error.message };
      }
      
      return { data };
    } catch (error) {
      console.error('API Error:', error);
      return {
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  },

  create: async (productData: any) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert(productData)
        .select()
        .single();
      
      if (error) {
        return { error: error.message };
      }
      
      return { data };
    } catch (error) {
      console.error('API Error:', error);
      return {
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  },

  approve: async (id: string, approved: boolean) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update({ approved })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        return { error: error.message };
      }
      
      return { data };
    } catch (error) {
      console.error('API Error:', error);
      return {
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  },

  getVendorProducts: async (vendorId: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('vendor_id', vendorId);
      
      if (error) {
        return { error: error.message };
      }
      
      return { data };
    } catch (error) {
      console.error('API Error:', error);
      return {
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  },
};

// Orders API
export const ordersAPI = {
  getAll: async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*');
      
      if (error) {
        return { error: error.message };
      }
      
      return { data };
    } catch (error) {
      console.error('API Error:', error);
      return {
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  },

  getCustomerOrders: async (customerId: string) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_id', customerId);
      
      if (error) {
        return { error: error.message };
      }
      
      return { data };
    } catch (error) {
      console.error('API Error:', error);
      return {
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  },

  getVendorOrders: async (vendorId: string) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('vendor_id', vendorId);
      
      if (error) {
        return { error: error.message };
      }
      
      return { data };
    } catch (error) {
      console.error('API Error:', error);
      return {
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  },

  create: async (orderData: any) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();
      
      if (error) {
        return { error: error.message };
      }
      
      return { data };
    } catch (error) {
      console.error('API Error:', error);
      return {
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  },

  updateStatus: async (id: string, status: string) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        return { error: error.message };
      }
      
      return { data };
    } catch (error) {
      console.error('API Error:', error);
      return {
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  },
};

// Reviews API
export const reviewsAPI = {
  getProductReviews: async (productId: string) => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId);
      
      if (error) {
        return { error: error.message };
      }
      
      return { data };
    } catch (error) {
      console.error('API Error:', error);
      return {
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  },

  create: async (reviewData: any) => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert(reviewData)
        .select()
        .single();
      
      if (error) {
        return { error: error.message };
      }
      
      return { data };
    } catch (error) {
      console.error('API Error:', error);
      return {
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  },
};

// Export all APIs
const api = {
  auth: authAPI,
  products: productsAPI,
  orders: ordersAPI,
  reviews: reviewsAPI,
};

export default api;
