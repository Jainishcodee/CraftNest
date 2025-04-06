import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  ShoppingBag,
  Package,
  CheckCheck,
  AlertCircle,
  DollarSign,
  BarChart4,
  Clock,
  Upload,
} from 'lucide-react';

// Dashboard stats component
const DashboardStats = () => {
  const { user } = useAuth();
  const { products, orders } = useData();
  
  if (!user) return null;
  
  // Filter vendor-specific data
  const vendorProducts = products.filter(p => p.vendorId === user.id);
  const vendorOrders = orders.filter(o => o.vendorId === user.id);
  
  // Calculate dashboard stats
  const totalProducts = vendorProducts.length;
  const approvedProducts = vendorProducts.filter(p => p.approved).length;
  const pendingProducts = totalProducts - approvedProducts;
  
  const totalOrders = vendorOrders.length;
  const completedOrders = vendorOrders.filter(o => o.status === 'delivered').length;
  const pendingOrders = vendorOrders.filter(o => o.status === 'pending').length;
  
  const totalEarnings = vendorOrders.reduce((sum, order) => sum + order.total, 0);
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${totalEarnings.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            +${(totalEarnings * 0.1).toFixed(2)} from last month
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          <ShoppingBag className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalOrders}</div>
          <p className="text-xs text-muted-foreground">
            {pendingOrders} pending, {completedOrders} completed
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Products</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalProducts}</div>
          <p className="text-xs text-muted-foreground">
            {pendingProducts} pending approval
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
          <BarChart4 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {totalProducts === 0 ? '0.0%' : ((totalOrders / totalProducts) * 100).toFixed(1) + '%'}
          </div>
          <p className="text-xs text-muted-foreground">
            Orders per product
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

// Recent orders component
const RecentOrders = () => {
  const { user } = useAuth();
  const { orders, updateOrderStatus } = useData();
  
  if (!user) return null;
  
  // Filter and sort vendor orders
  const vendorOrders = orders
    .filter(o => o.vendorId === user.id)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  
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
  
  // Function to get next status
  const getNextStatus = (currentStatus: string): 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' => {
    switch (currentStatus) {
      case 'pending':
        return 'processing';
      case 'processing':
        return 'shipped';
      case 'shipped':
        return 'delivered';
      default:
        return currentStatus as 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    }
  };
  
  // Handle status update
  const handleUpdateStatus = async (orderId: string, currentStatus: string) => {
    const nextStatus = getNextStatus(currentStatus);
    if (nextStatus !== currentStatus) {
      await updateOrderStatus(orderId, nextStatus);
    }
  };
  
  return (
    <Card>
      <CardHeader className="flex justify-between items-start">
        <div>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>
            Manage and fulfill your customer orders
          </CardDescription>
        </div>
        
        <Link to="/vendor/orders">
          <Button variant="outline" size="sm">
            View All
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {vendorOrders.length === 0 ? (
          <div className="text-center py-6">
            <ShoppingBag className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p>No orders yet</p>
          </div>
        ) : (
          <div className="space-y-6">
            {vendorOrders.slice(0, 5).map(order => (
              <div key={order.id} className="space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">Order #{order.id.slice(-5)}</h4>
                      <Badge variant={getStatusBadgeVariant(order.status)}>
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {order.customerName} • {order.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                  <p className="font-semibold">${order.total.toFixed(2)}</p>
                </div>
                
                <div className="text-sm">
                  {order.products.map(product => (
                    <div key={product.productId} className="flex justify-between py-1 border-b">
                      <span>
                        {product.name} × {product.quantity}
                      </span>
                      <span>${(product.price * product.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm text-muted-foreground">
                    {order.shippingAddress.split(',')[0]}...
                  </span>
                  
                  {order.status !== 'delivered' && order.status !== 'cancelled' && (
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStatus(order.id, order.status)}
                    >
                      Mark as {getNextStatus(order.status)}
                    </Button>
                  )}
                </div>
                <Separator />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Product approval status component
const ProductStatus = () => {
  const { user } = useAuth();
  const { products } = useData();
  
  if (!user) return null;
  
  // Filter vendor products
  const vendorProducts = products.filter(p => p.vendorId === user.id);
  
  // Group by approval status
  const approvedProducts = vendorProducts.filter(p => p.approved);
  const pendingProducts = vendorProducts.filter(p => !p.approved);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Status</CardTitle>
        <CardDescription>
          Status of your product submissions
        </CardDescription>
      </CardHeader>
      <CardContent>
        {vendorProducts.length === 0 ? (
          <div className="text-center py-6">
            <Package className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p>No products uploaded yet</p>
            <Link to="/vendor/upload">
              <Button className="mt-4">
                <Upload className="mr-2 h-4 w-4" />
                Upload a Product
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {pendingProducts.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-3 flex items-center">
                  <Clock className="h-4 w-4 mr-1 text-amber-500" />
                  Pending Approval ({pendingProducts.length})
                </h3>
                
                <div className="space-y-3">
                  {pendingProducts.map(product => (
                    <div key={product.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-10 w-10 bg-muted rounded">
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover rounded"
                          />
                        </div>
                        <span className="font-medium">{product.name}</span>
                      </div>
                      <Badge variant="outline">Pending</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {approvedProducts.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-3 flex items-center">
                  <CheckCheck className="h-4 w-4 mr-1 text-craft-sage" />
                  Approved ({approvedProducts.length})
                </h3>
                
                <div className="space-y-3">
                  {approvedProducts.slice(0, 3).map(product => (
                    <div key={product.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-10 w-10 bg-muted rounded">
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover rounded"
                          />
                        </div>
                        <span className="font-medium">{product.name}</span>
                      </div>
                      <Badge variant="secondary">Live</Badge>
                    </div>
                  ))}
                  
                  {approvedProducts.length > 3 && (
                    <Link to="/vendor/products">
                      <Button variant="link" className="p-0">
                        View all {approvedProducts.length} approved products
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

const VendorDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  
  // Redirect if user is not a vendor
  if (!isAuthenticated || user?.role !== 'vendor') {
    return <Navigate to="/login" />;
  }
  
  return (
    <div className="craft-container py-8 md:py-12">
      <h1 className="craft-heading mb-8">Vendor Dashboard</h1>
      
      <Tabs defaultValue="overview" className="space-y-8">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-8">
          <DashboardStats />
          <div className="grid gap-4 md:grid-cols-2">
            <RecentOrders />
            <ProductStatus />
          </div>
          
          <div className="flex justify-center mt-8">
            <Button size="lg" asChild>
              <Link to="/vendor/upload">
                <Upload className="mr-2 h-4 w-4" />
                Upload New Product
              </Link>
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Product Management</CardTitle>
              <CardDescription>
                Manage your products in the marketplace
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">
                Product management functionality would go here
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Order Management</CardTitle>
              <CardDescription>
                View and manage your customer orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">
                Order management functionality would go here
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="earnings">
          <Card>
            <CardHeader>
              <CardTitle>Earnings</CardTitle>
              <CardDescription>
                Track your sales and revenue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">
                Earnings and analytics functionality would go here
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VendorDashboard;
