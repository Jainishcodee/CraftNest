
import React, { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import {
  ShoppingBag,
  Heart,
  Star,
  Clock,
  PackageCheck,
  User,
} from 'lucide-react';

interface Order {
  id: string;
  customer_id: string;
  customer_name: string;
  vendor_id: string;
  vendor_name: string;
  products: {
    product_id: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address: string;
  payment_method: string;
  created_at: string;
  updated_at: string;
}

interface Review {
  id: string;
  product_id: string;
  customer_id: string;
  customer_name: string;
  rating: number;
  comment: string;
  created_at: string;
  product: {
    name: string;
  };
}

const CustomerDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  // Redirect if user is not authenticated or not a customer
  if (!isAuthenticated || user?.role !== 'customer') {
    return <Navigate to="/login" />;
  }
  
  useEffect(() => {
    const fetchCustomerData = async () => {
      setIsLoading(true);
      try {
        // Fetch customer orders
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .eq('customer_id', user.id)
          .order('created_at', { ascending: false });
        
        if (orderError) {
          throw orderError;
        }
        
        setOrders(orderData || []);
        
        // Fetch customer reviews with product info
        const { data: reviewData, error: reviewError } = await supabase
          .from('reviews')
          .select(`
            *,
            product:products (
              name
            )
          `)
          .eq('customer_id', user.id)
          .order('created_at', { ascending: false });
        
        if (reviewError) {
          throw reviewError;
        }
        
        setReviews(reviewData || []);
      } catch (error) {
        console.error('Error fetching customer data:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load your data. Please try again later.',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user?.id) {
      fetchCustomerData();
    }
  }, [user?.id, toast]);
  
  // Function to get badge variant based on order status
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'outline';
      case 'shipped':
        return 'secondary';
      case 'processing':
        return 'default';
      case 'pending':
        return 'destructive';
      default:
        return 'outline';
    }
  };
  
  // Handle order status update
  const handleConfirmDelivery = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'delivered',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: 'delivered', updated_at: new Date().toISOString() } 
          : order
      ));
      
      toast({
        title: 'Delivery confirmed',
        description: 'Thank you for confirming your delivery.',
      });
    } catch (error) {
      console.error('Error confirming delivery:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to confirm delivery. Please try again.',
      });
    }
  };
  
  if (isLoading) {
    return (
      <div className="craft-container py-8 md:py-12">
        <h1 className="craft-heading mb-8">Customer Dashboard</h1>
        <div className="text-center py-8">
          <p>Loading your data...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="craft-container py-8 md:py-12">
      <h1 className="craft-heading mb-8">Customer Dashboard</h1>
      
      <Tabs defaultValue="orders" className="space-y-8">
        <TabsList>
          <TabsTrigger value="orders">My Orders</TabsTrigger>
          <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>
        
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>My Orders</CardTitle>
              <CardDescription>
                Track and manage your orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingBag className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No orders yet</h3>
                  <p className="text-muted-foreground mb-6">
                    You haven't placed any orders yet. Start shopping to see your orders here.
                  </p>
                  <Button asChild>
                    <Link to="/products">Browse Products</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-8">
                  {orders.map(order => (
                    <div key={order.id}>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                        <div>
                          <div className="flex items-center mb-1">
                            <h3 className="font-medium">Order #{order.id.slice(-5)}</h3>
                            <Badge variant={getStatusBadgeVariant(order.status)} className="ml-2">
                              {order.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Placed on {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="mt-2 sm:mt-0 text-right">
                          <p className="font-semibold">${order.total.toFixed(2)}</p>
                          <p className="text-sm text-muted-foreground">
                            From {order.vendor_name}
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-muted/40 rounded-md p-4">
                        {order.products.map(product => (
                          <div key={product.product_id} className="flex justify-between py-2 border-b last:border-0">
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">{product.quantity}×</span>
                              <span>{product.name}</span>
                            </div>
                            <span>${(product.price * product.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex justify-end mt-4">
                        {order.status === 'delivered' && (
                          <Button size="sm" variant="outline" asChild>
                            <Link to={`/product/${order.products[0].product_id}`}>
                              <Star className="mr-2 h-4 w-4" />
                              Write a Review
                            </Link>
                          </Button>
                        )}
                        
                        {order.status === 'shipped' && (
                          <Button 
                            size="sm"
                            onClick={() => handleConfirmDelivery(order.id)}
                          >
                            <PackageCheck className="mr-2 h-4 w-4" />
                            Confirm Delivery
                          </Button>
                        )}
                        
                        {(order.status === 'pending' || order.status === 'processing') && (
                          <div className="flex items-center">
                            <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {order.status === 'pending' ? 'Waiting for processing' : 'In progress'}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <Separator className="mt-6 mb-6" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="wishlist">
          <Card>
            <CardHeader>
              <CardTitle>My Wishlist</CardTitle>
              <CardDescription>
                Products you've saved for later
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Heart className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Your wishlist is empty</h3>
                <p className="text-muted-foreground mb-6">
                  Save items you love to your wishlist for quick access later
                </p>
                <Button asChild>
                  <Link to="/products">Browse Products</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reviews">
          <Card>
            <CardHeader>
              <CardTitle>My Reviews</CardTitle>
              <CardDescription>
                Reviews you've left on products
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reviews.length === 0 ? (
                <div className="text-center py-8">
                  <Star className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No reviews yet</h3>
                  <p className="text-muted-foreground mb-6">
                    After purchasing and receiving products, you can share your experience
                  </p>
                  <Button asChild>
                    <Link to="/products">Browse Products</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {reviews.map(review => (
                    <div key={review.id} className="bg-muted/40 p-4 rounded-md">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
                        <Link to={`/product/${review.product_id}`} className="font-medium hover:text-craft-teal transition-colors">
                          {review.product?.name || "Product"}
                        </Link>
                        <div className="flex mt-1 sm:mt-0">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= review.rating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm mb-2">{review.comment}</p>
                      <p className="text-xs text-muted-foreground">
                        Posted on {new Date(review.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                Manage your account information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-center sm:justify-start">
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className="font-medium text-lg">{user.name}</h3>
                    <p className="text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex justify-center">
                  <Button className="w-full max-w-xs" disabled>
                    Edit Profile
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerDashboard;
