import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Star, Minus, Plus, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import ProductReviews from '@/components/common/ProductReviews';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  vendor_id: string;
  vendor_name: string;
  category: string;
  images: string[];
  rating: number;
  review_count: number;
  approved: boolean;
  featured: boolean;
  stock: number;
  created_at: string;
}

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast: uiToast } = useToast();
  
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) {
          throw error;
        }
        
        setProduct(data as Product);
      } catch (error) {
        console.error('Error fetching product:', error);
        uiToast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load product details.',
        });
        navigate('/products');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProduct();
  }, [id, navigate, uiToast]);
  
  const handleAddToCart = () => {
    if (product) {
      toast.success('Added to cart', {
        description: `${quantity} × ${product.name} added to your cart`,
      });
    }
  };
  
  const handleQuantityChange = (amount: number) => {
    const newQuantity = quantity + amount;
    if (product && newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };
  
  if (isLoading) {
    return (
      <div className="craft-container py-16 text-center">
        <p>Loading product details...</p>
      </div>
    );
  }
  
  if (!product || !product.approved) {
    return (
      <div className="craft-container py-16 text-center">
        <h2 className="text-2xl font-semibold mb-4">Product Not Found</h2>
        <p className="text-muted-foreground mb-6">The product you're looking for doesn't exist or is not available.</p>
        <Button onClick={() => navigate('/products')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Button>
      </div>
    );
  }
  
  return (
    <div className="craft-container py-8 md:py-12">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        <div>
          <AspectRatio ratio={1}>
            <img
              src={product.images[0]}
              alt={product.name}
              className="object-cover w-full h-full rounded-lg"
            />
          </AspectRatio>
        </div>
        
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">{product.category}</Badge>
              {product.featured && (
                <Badge className="bg-craft-terracotta">Featured</Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <div className="flex items-center gap-1 mt-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= Math.round(product.rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                ({product.review_count} {product.review_count === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          </div>
          
          <p className="text-3xl font-bold text-craft-teal">
            ${product.price.toFixed(2)}
          </p>
          
          <p className="text-muted-foreground">{product.description}</p>
          
          <div>
            <p className="font-medium mb-2">By: {product.vendor_name}</p>
            <p className="text-sm text-muted-foreground">
              Added on {new Date(product.created_at).toLocaleDateString()}
            </p>
          </div>
          
          <Separator />
          
          <div>
            <p className="font-medium mb-3">Quantity:</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center border rounded-md">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-10 text-center">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= product.stock}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                {product.stock} available
              </p>
            </div>
          </div>
          
          <div className="pt-2">
            <Button
              onClick={handleAddToCart}
              className="craft-btn-primary w-full md:w-auto"
              size="lg"
              disabled={product.stock === 0}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </Button>
          </div>
        </div>
      </div>
      
      <div className="mt-16">
        <Separator className="mb-8" />
        <ProductReviews productId={product.id} />
      </div>
    </div>
  );
};

export default ProductDetails;
