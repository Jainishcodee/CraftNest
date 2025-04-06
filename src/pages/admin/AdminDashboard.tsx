
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ShoppingBag, Users, DollarSign, Package, CheckCheck, BarChart } from 'lucide-react';
import { toast } from 'sonner';
import { useNotifications } from '@/contexts/NotificationContext';

// Dashboard stats component
const DashboardStats = () => {
  const { products, orders } = useData();
  
  // Calculate dashboard stats
  const totalProducts = products.length;
  const approvedProducts = products.filter(p => p.approved).length;
  const pendingProducts = totalProducts - approvedProducts;
  
  const totalOrders = orders.length;
  const completedOrders = orders.filter(o => o.status === 'delivered').length;
  
  const totalSales = orders.reduce((sum, order) => sum + order.total, 0);
  const profit = totalSales * 0.1; // Assuming 10% commission
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${totalSales.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            +{(totalSales * 0.05).toFixed(2)} from last month
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Commission Earned</CardTitle>
          <BarChart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${profit.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            10% of total sales
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
            {completedOrders} completed, {totalOrders - completedOrders} in progress
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
    </div>
  );
};

// Pending approvals component
const PendingApprovals = () => {
  const { products, approveProduct } = useData();
  const { addNotification } = useNotifications();
  const [isApproving, setIsApproving] = useState<Record<string, boolean>>({});
  
  // Filter pending products
  const pendingProducts = products.filter(p => !p.approved);
  
  // Handle product approval
  const handleApprove = async (productId: string) => {
    setIsApproving(prev => ({ ...prev, [productId]: true }));
    
    try {
      await approveProduct(productId);
      
      const product = products.find(p => p.id === productId);
      if (product) {
        // Notify vendor
        addNotification({
          title: 'Product Approved',
          message: `Your product "${product.name}" has been approved and is now live on the marketplace.`,
          type: 'success',
          forRole: 'vendor',
        });
        
        toast.success('Product approved', {
          description: `${product.name} is now live on the marketplace`,
        });
      }
    } catch (error) {
      toast.error('Error', {
        description: 'Failed to approve product. Please try again.',
      });
    } finally {
      setIsApproving(prev => ({ ...prev, [productId]: false }));
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Approvals</CardTitle>
        <CardDescription>
          Review and approve new product submissions
        </CardDescription>
      </CardHeader>
      <CardContent>
        {pendingProducts.length === 0 ? (
          <div className="text-center py-6">
            <CheckCheck className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p>No pending products to approve</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingProducts.map(product => (
              <div key={product.id} className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-muted rounded">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium">{product.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>By {product.vendorName}</span>
                      <span>•</span>
                      <Badge variant="outline">{product.category}</Badge>
                      <span>•</span>
                      <span>${product.price.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={() => handleApprove(product.id)}
                  disabled={isApproving[product.id]}
                >
                  {isApproving[product.id] ? 'Approving...' : 'Approve'}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Recent orders component
const RecentOrders = () => {
  const { orders } = useData();
  
  // Get recent orders, sorted by date
  const recentOrders = [...orders]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);
  
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
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Orders</CardTitle>
        <CardDescription>
          Latest orders across the platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        {recentOrders.length === 0 ? (
          <div className="text-center py-6">
            <ShoppingBag className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p>No orders found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentOrders.map(order => (
              <div key={order.id} className="flex justify-between items-center border-b pb-3">
                <div>
                  <div className="font-medium">Order #{order.id.slice(-5)}</div>
                  <div className="text-sm text-muted-foreground flex flex-col sm:flex-row sm:gap-2">
                    <span>{order.customerName}</span>
                    <span className="hidden sm:inline">•</span>
                    <span>${order.total.toFixed(2)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={getStatusBadgeVariant(order.status)}>
                    {order.status}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {order.createdAt.toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const AdminDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  
  // Redirect if user is not an admin
  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/login" />;
  }
  
  return (
    <div className="craft-container py-8 md:py-12">
      <h1 className="craft-heading mb-8">Admin Dashboard</h1>
      
      <Tabs defaultValue="overview" className="space-y-8">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-8">
          <DashboardStats />
          <div className="grid gap-4 md:grid-cols-2">
            <PendingApprovals />
            <RecentOrders />
          </div>
        </TabsContent>
        
        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Products Management</CardTitle>
              <CardDescription>
                Manage all products in the marketplace
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
              <CardTitle>Orders Management</CardTitle>
              <CardDescription>
                Manage and monitor all orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">
                Order management functionality would go here
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
