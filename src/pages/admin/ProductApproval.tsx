
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';

interface Product {
  id: string;
  name: string;
  vendor_name: string;
  category: string;
  price: number;
  approved: boolean;
  created_at: string;
  images: string[];
}

const ProductApproval = () => {
  const { user, isAuthenticated } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  // Redirect if not admin
  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/login" />;
  }

  // Fetch pending approval products
  useEffect(() => {
    const fetchPendingProducts = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('approved', false)
          .order('created_at', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        setProducts(data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load products pending approval.',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPendingProducts();
  }, [toast]);
  
  // Handle product approval/rejection
  const handleApprove = async (productId: string, approved: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ approved })
        .eq('id', productId);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setProducts(products.filter(product => product.id !== productId));
      
      toast({
        title: approved ? 'Product approved' : 'Product rejected',
        description: approved 
          ? 'The product is now visible to customers' 
          : 'The product has been rejected',
      });
    } catch (error) {
      console.error('Error updating product approval:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update product status.',
      });
    }
  };
  
  return (
    <div className="craft-container py-8 md:py-12">
      <h1 className="craft-heading mb-8">Product Approval</h1>
      
      {isLoading ? (
        <div className="text-center py-8">
          <p>Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 bg-muted/20 rounded-lg">
          <h2 className="font-medium text-xl mb-2">No products waiting for approval</h2>
          <p className="text-muted-foreground">
            All products have been reviewed. Check back later for new submissions.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Image</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map(product => (
                <TableRow key={product.id}>
                  <TableCell>
                    <img 
                      src={product.images[0]} 
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.vendor_name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{product.category}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    ${product.price.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => handleApprove(product.id, false)}
                      >
                        <X className="mr-1 h-4 w-4" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleApprove(product.id, true)}
                      >
                        <Check className="mr-1 h-4 w-4" />
                        Approve
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default ProductApproval;
