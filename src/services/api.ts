
// API service to connect React frontend with TypeScript backend

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

const API_URL = 'http://localhost:3001/api';

// Generic fetch function with error handling
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        error: data.message || `Error: ${response.status}`,
      };
    }

    return { data: data as T };
  } catch (error) {
    console.error('API Error:', error);
    return {
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

// Auth API
export const authAPI = {
  login: (email: string, password: string, role: string) =>
    fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role }),
    }),

  register: (name: string, email: string, password: string, role: string) =>
    fetchAPI('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    }),
};

// Products API
export const productsAPI = {
  getAll: (approved?: boolean) =>
    fetchAPI(`/products${approved !== undefined ? `?approved=${approved}` : ''}`),

  getById: (id: string) => fetchAPI(`/products/${id}`),

  create: (productData: any) =>
    fetchAPI('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    }),

  approve: (id: string, approved: boolean) =>
    fetchAPI(`/products/${id}/approve`, {
      method: 'PATCH',
      body: JSON.stringify({ approved }),
    }),

  getVendorProducts: (vendorId: string) =>
    fetchAPI(`/products/vendor/${vendorId}`),
};

// Orders API
export const ordersAPI = {
  getAll: () => fetchAPI('/orders'),

  getCustomerOrders: (customerId: string) =>
    fetchAPI(`/orders/customer/${customerId}`),

  getVendorOrders: (vendorId: string) =>
    fetchAPI(`/orders/vendor/${vendorId}`),

  create: (orderData: any) =>
    fetchAPI('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    }),

  updateStatus: (id: string, status: string) =>
    fetchAPI(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};

// Reviews API
export const reviewsAPI = {
  getProductReviews: (productId: string) =>
    fetchAPI(`/reviews/product/${productId}`),

  create: (reviewData: any) =>
    fetchAPI('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    }),
};

// Export all APIs
const api = {
  auth: authAPI,
  products: productsAPI,
  orders: ordersAPI,
  reviews: reviewsAPI,
};

export default api;
