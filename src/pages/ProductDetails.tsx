
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Star, Minus, Plus, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import ProductReviews from '@/components/common/ProductReviews';

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { products, addToCart } = useData();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  
  // Find the product by id
  const product = products.find(p => p.id === id);
  
  // If product not found or not approved, redirect to products page
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
  
  const handleQuantityChange = (amount: number) => {
    const newQuantity = quantity + amount;
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };
  
  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast.success('Added to cart', {
      description: `${quantity} × ${product.name} added to your cart`,
    });
  };
  
  return (
    <div className="craft-container py-8 md:py-12">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Product image */}
        <div>
          <AspectRatio ratio={1}>
            <img
              src={product.images[0]}
              alt={product.name}
              className="object-cover w-full h-full rounded-lg"
            />
          </AspectRatio>
        </div>
        
        {/* Product info */}
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
                ({product.reviewCount} {product.reviewCount === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          </div>
          
          <p className="text-3xl font-bold text-craft-teal">
            ${product.price.toFixed(2)}
          </p>
          
          <p className="text-muted-foreground">{product.description}</p>
          
          <div>
            <p className="font-medium mb-2">By: {product.vendorName}</p>
            <p className="text-sm text-muted-foreground">
              Added on {product.createdAt.toLocaleDateString()}
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
      
      {/* Reviews section */}
      <div className="mt-16">
        <Separator className="mb-8" />
        <ProductReviews productId={product.id} />
      </div>
    </div>
  );
};

export default ProductDetails;
