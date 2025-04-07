
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData, Product, Order, OrderStatus } from '@/contexts/DataContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, Search, Check, X, Eye, Clock, Package, Truck, CheckCircle2, RotateCcw, DollarSign, ShoppingBag, BarChart3 } from 'lucide-react';

const AdminDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const { products, orders, approveProduct, updateOrderStatus } = useData();
  const { addNotification } = useNotifications();
  
  // Redirect if not authenticated or not admin
  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/login?role=admin" />;
  }
  
  // Active tab state
  const [activeTab, setActiveTab] = useState('overview');
  
  // Overview states
  const pendingApprovalCount = products.filter(p => !p.approved).length;
  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;
  const totalProductCount = products.length;
  
  // Calculate total sales
  const totalSales = orders
    .filter(order => order.status !== 'cancelled')
    .reduce((total, order) => total + order.total, 0);
  
  // Estimate profit (assuming 30% profit margin)
  const estimatedProfit = totalSales * 0.3;
  
  // Products tab states
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [productsFilter, setProductsFilter] = useState('all');
  const [currentProductsPage, setCurrentProductsPage] = useState(1);
  const productsPerPage = 5;
  
  // Filter products
  const filteredProducts = products
    .filter(product => {
      if (productsFilter === 'all') return true;
      if (productsFilter === 'approved') return product.approved;
      if (productsFilter === 'pending') return !product.approved;
      if (productsFilter === 'featured') return product.featured;
      return true;
    })
    .filter(product =>
      product.name.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
      product.vendorName.toLowerCase().includes(productSearchQuery.toLowerCase())
    );

  // Calculate products pagination
  const totalProductsPages = Math.ceil(filteredProducts.length / productsPerPage);
  const indexOfLastProduct = currentProductsPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  
  // Orders tab states
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [ordersFilter, setOrdersFilter] = useState('all');
  const [currentOrdersPage, setCurrentOrdersPage] = useState(1);
  const ordersPerPage = 5;
  
  // Filter orders
  const filteredOrders = orders
    .filter(order => {
      if (ordersFilter === 'all') return true;
      return order.status === ordersFilter;
    })
    .filter(order =>
      order.id.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      order.vendorName.toLowerCase().includes(orderSearchQuery.toLowerCase())
    );

  // Calculate orders pagination
  const totalOrdersPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const indexOfLastOrder = currentOrdersPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  
  // Handle product approval
  const handleApproveProduct = async (productId: string) => {
    try {
      await approveProduct(productId);
      
      // Find the product to get its details for the notification
      const product = products.find(p => p.id === productId);
      
      // Send notification to vendor
      if (product) {
        addNotification({
          title: 'Product Approved',
          message: `Your product "${product.name}" has been approved and is now live.`,
          type: 'success',
          forRole: 'vendor'
        });
        
        toast.success('Product Approved', {
          description: `"${product.name}" is now live on the marketplace.`
        });
      }
    } catch (error) {
      toast.error('Error', {
        description: 'Failed to approve product. Please try again.'
      });
    }
  };

  // Handle order status update
  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, status);
      
      // Find the order to get its details for the notification
      const order = orders.find(o => o.id === orderId);
      
      // Determine notification message based on status
      let statusMessage = '';
      switch (status) {
        case 'processing':
          statusMessage = 'is now being processed';
          break;
        case 'shipped':
          statusMessage = 'has been shipped';
          break;
        case 'delivered':
          statusMessage = 'has been delivered';
          break;
        case 'cancelled':
          statusMessage = 'has been cancelled';
          break;
        default:
          statusMessage = 'status has been updated';
      }
      
      // Send notification to customer
      if (order) {
        addNotification({
          title: 'Order Update',
          message: `Your order #${order.id} ${statusMessage}.`,
          type: 'info',
          forRole: 'customer'
        });
        
        // Send notification to vendor if relevant
        if (status === 'processing' || status === 'shipped') {
          addNotification({
            title: 'Order Update',
            message: `Order #${order.id} ${statusMessage}.`,
            type: 'info',
            forRole: 'vendor'
          });
        }
        
        toast.success('Order Updated', {
          description: `Order #${order.id} ${statusMessage}.`
        });
      }
    } catch (error) {
      toast.error('Error', {
        description: 'Failed to update order status. Please try again.'
      });
    }
  };
  
  // Get next status options for an order
  const getNextStatus = (currentStatus: OrderStatus): { status: OrderStatus, label: string }[] => {
    switch (currentStatus) {
      case 'pending':
        return [
          { status: 'processing', label: 'Process' },
          { status: 'cancelled', label: 'Cancel' }
        ];
      case 'processing':
        return [
          { status: 'shipped', label: 'Ship' },
          { status: 'cancelled', label: 'Cancel' }
        ];
      case 'shipped':
        return [
          { status: 'delivered', label: 'Mark Delivered' }
        ];
      default:
        return [];
    }
  };
  
  // Get status badge color
  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">
          <Clock className="w-3 h-3 mr-1" /> Pending
        </Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
          <Package className="w-3 h-3 mr-1" /> Processing
        </Badge>;
      case 'shipped':
        return <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-200">
          <Truck className="w-3 h-3 mr-1" /> Shipped
        </Badge>;
      case 'delivered':
        return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
          <CheckCircle2 className="w-3 h-3 mr-1" /> Delivered
        </Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
          <X className="w-3 h-3 mr-1" /> Cancelled
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage products, orders, and marketplace settings.</p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-3 md:w-[400px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Pending Approvals Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingApprovalCount}</div>
                <p className="text-xs text-muted-foreground">
                  Products waiting for your review
                </p>
              </CardContent>
            </Card>
            
            {/* Pending Orders Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingOrdersCount}</div>
                <p className="text-xs text-muted-foreground">
                  Orders awaiting processing
                </p>
              </CardContent>
            </Card>
            
            {/* Total Products Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalProductCount}</div>
                <p className="text-xs text-muted-foreground">
                  Products on the marketplace
                </p>
              </CardContent>
            </Card>

            {/* Total Sales Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalSales.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  Total value of all orders
                </p>
              </CardContent>
            </Card>
            
            {/* Estimated Profit Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Estimated Profit</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${estimatedProfit.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  30% of total sales (approx)
                </p>
              </CardContent>
            </Card>
            
            {/* Product Categories Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Categories</CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Set(products.map(p => p.category)).size}
                </div>
                <p className="text-xs text-muted-foreground">
                  Product categories available
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* Pending Approvals Table */}
          <Card>
            <CardHeader>
              <CardTitle>Pending Approvals</CardTitle>
              <CardDescription>
                Review and approve new products submitted by vendors
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingApprovalCount > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products
                      .filter(product => !product.approved)
                      .slice(0, 5)
                      .map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>{product.vendorName}</TableCell>
                          <TableCell>${product.price.toFixed(2)}</TableCell>
                          <TableCell className="capitalize">{product.category}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => window.location.href = `/product/${product.id}`}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              <Button 
                                size="sm" 
                                onClick={() => handleApproveProduct(product.id)}
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No pending approvals
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Orders Table */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>
                Latest orders across the marketplace
              </CardDescription>
            </CardHeader>
            <CardContent>
              {orders.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders
                      .slice(0, 5)
                      .map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">#{order.id}</TableCell>
                          <TableCell>{order.customerName}</TableCell>
                          <TableCell>${order.total.toFixed(2)}</TableCell>
                          <TableCell>{getStatusBadge(order.status)}</TableCell>
                          <TableCell className="text-right">
                            {order.createdAt.toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No orders found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Products Tab */}
        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Products Management</CardTitle>
              <CardDescription>
                View, approve, and manage all products in the marketplace
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filters and Search */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search products..."
                    className="pl-8"
                    value={productSearchQuery}
                    onChange={(e) => setProductSearchQuery(e.target.value)}
                  />
                </div>
                <Select 
                  value={productsFilter} 
                  onValueChange={setProductsFilter}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Products</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="pending">Pending Approval</SelectItem>
                    <SelectItem value="featured">Featured</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Products Table */}
              {currentProducts.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.vendorName}</TableCell>
                        <TableCell>${product.price.toFixed(2)}</TableCell>
                        <TableCell className="capitalize">{product.category}</TableCell>
                        <TableCell>
                          {product.approved ? (
                            <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                              Approved
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">
                              Pending
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => window.location.href = `/product/${product.id}`}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            {!product.approved && (
                              <Button 
                                size="sm" 
                                onClick={() => handleApproveProduct(product.id)}
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No products found matching your filters
                </div>
              )}
              
              {/* Products Pagination */}
              {filteredProducts.length > productsPerPage && (
                <div className="flex items-center justify-end space-x-2 py-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentProductsPage(prev => Math.max(prev - 1, 1))}
                    className={currentProductsPage === 1 ? "opacity-50 cursor-not-allowed" : ""}
                    disabled={currentProductsPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    Page {currentProductsPage} of {totalProductsPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentProductsPage(prev => Math.min(prev + 1, totalProductsPages))}
                    className={currentProductsPage === totalProductsPages ? "opacity-50 cursor-not-allowed" : ""}
                    disabled={currentProductsPage === totalProductsPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Orders Management</CardTitle>
              <CardDescription>
                Monitor and manage all marketplace orders
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filters and Search */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search orders..."
                    className="pl-8"
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                  />
                </div>
                <Select 
                  value={ordersFilter} 
                  onValueChange={setOrdersFilter}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Orders</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Orders Table */}
              {currentOrders.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">#{order.id}</TableCell>
                        <TableCell>{order.customerName}</TableCell>
                        <TableCell>{order.vendorName}</TableCell>
                        <TableCell>${order.total.toFixed(2)}</TableCell>
                        <TableCell>
                          {getStatusBadge(order.status)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {order.status !== 'delivered' && order.status !== 'cancelled' && (
                              <div className="flex gap-2">
                                {getNextStatus(order.status).map((nextStatus) => (
                                  <Button
                                    key={nextStatus.status}
                                    size="sm"
                                    variant={nextStatus.status === 'cancelled' ? 'destructive' : 'default'}
                                    onClick={() => handleUpdateOrderStatus(order.id, nextStatus.status)}
                                  >
                                    {nextStatus.status === 'cancelled' ? (
                                      <X className="h-4 w-4 mr-1" />
                                    ) : nextStatus.status === 'delivered' ? (
                                      <CheckCircle2 className="h-4 w-4 mr-1" />
                                    ) : (
                                      <RotateCcw className="h-4 w-4 mr-1" />
                                    )}
                                    {nextStatus.label}
                                  </Button>
                                ))}
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No orders found matching your filters
                </div>
              )}
              
              {/* Orders Pagination */}
              {filteredOrders.length > ordersPerPage && (
                <div className="flex items-center justify-end space-x-2 py-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentOrdersPage(prev => Math.max(prev - 1, 1))}
                    className={currentOrdersPage === 1 ? "opacity-50 cursor-not-allowed" : ""}
                    disabled={currentOrdersPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    Page {currentOrdersPage} of {totalOrdersPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentOrdersPage(prev => Math.min(prev + 1, totalOrdersPages))}
                    className={currentOrdersPage === totalOrdersPages ? "opacity-50 cursor-not-allowed" : ""}
                    disabled={currentOrdersPage === totalOrdersPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
