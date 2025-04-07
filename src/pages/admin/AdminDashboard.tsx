import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ShoppingBag, Users, DollarSign, Package, CheckCheck, BarChart, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useNotifications } from '@/contexts/NotificationContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

// Dashboard stats component
const DashboardStats = () => {
  const { products, orders } = useData();
  
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
  
  const pendingProducts = products.filter(p => !p.approved);
  
  const handleApprove = async (productId: string) => {
    setIsApproving(prev => ({ ...prev, [productId]: true }));
    
    try {
      await approveProduct(productId);
      
      const product = products.find(p => p.id === productId);
      if (product) {
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
  
  const recentOrders = [...orders]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);
  
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

// Products Management Tab Component
const ProductsManagement = () => {
  const { products, approveProduct } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isApproving, setIsApproving] = useState<Record<string, boolean>>({});
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const itemsPerPage = 5;

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.vendorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

  const handleApprove = async (productId: string) => {
    setIsApproving(prev => ({ ...prev, [productId]: true }));
    try {
      await approveProduct(productId);
      toast.success('Product approved successfully');
    } catch (error) {
      toast.error('Failed to approve product');
    } finally {
      setIsApproving(prev => ({ ...prev, [productId]: false }));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Products Management</CardTitle>
        <CardDescription>
          Manage all products in the marketplace
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row justify-between mb-4 gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="px-3 py-2 border rounded-md text-sm"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="pottery">Pottery</option>
            <option value="jewelry">Jewelry</option>
            <option value="woodwork">Woodwork</option>
            <option value="textiles">Textiles</option>
            <option value="art">Art</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    No products found
                  </TableCell>
                </TableRow>
              ) : (
                currentItems.map(product => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-muted rounded">
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="h-full w-full object-cover rounded"
                          />
                        </div>
                        <span className="font-medium">{product.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{product.vendorName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{product.category}</Badge>
                    </TableCell>
                    <TableCell>${product.price.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={product.approved ? "outline" : "default"}>
                        {product.approved ? 'Approved' : 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {!product.approved && (
                        <Button 
                          size="sm" 
                          onClick={() => handleApprove(product.id)}
                          disabled={isApproving[product.id]}
                        >
                          {isApproving[product.id] ? 'Approving...' : 'Approve'}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {totalPages > 1 && (
          <div className="mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  />
                </PaginationItem>
                
                {[...Array(totalPages)].map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink 
                      isActive={currentPage === i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Orders Management Tab Component
const OrdersManagement = () => {
  const { orders } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const itemsPerPage = 5;

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.includes(searchTerm) || 
                         order.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => 
    b.createdAt.getTime() - a.createdAt.getTime()
  );

  const totalPages = Math.ceil(sortedOrders.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedOrders.slice(indexOfFirstItem, indexOfLastItem);

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
        <CardTitle>Orders Management</CardTitle>
        <CardDescription>
          Manage and monitor all orders
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row justify-between mb-4 gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search order ID or customer..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="px-3 py-2 border rounded-md text-sm"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    No orders found
                  </TableCell>
                </TableRow>
              ) : (
                currentItems.map(order => (
                  <TableRow key={order.id}>
                    <TableCell>#{order.id.slice(-5)}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>
                      <div>
                        {order.products.map((product, idx) => (
                          <div key={idx} className="text-sm">
                            {product.quantity}x {product.name}
                            {idx < order.products.length - 1 && <span className="text-muted-foreground">, </span>}
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>${order.total.toFixed(2)}</TableCell>
                    <TableCell>{order.createdAt.toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(order.status)}>
                        {order.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {totalPages > 1 && (
          <div className="mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  />
                </PaginationItem>
                
                {[...Array(totalPages)].map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink 
                      isActive={currentPage === i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const AdminDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  
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
          <ProductsManagement />
        </TabsContent>
        
        <TabsContent value="orders">
          <OrdersManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
