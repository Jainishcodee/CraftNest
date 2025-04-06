
import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '@/contexts/DataContext';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAddToCart?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  return (
    <div className="craft-card group">
      <Link to={`/product/${product.id}`}>
        <div className="relative">
          <AspectRatio ratio={4/3}>
            <img
              src={product.images[0]}
              alt={product.name}
              className="object-cover w-full h-full transition-transform group-hover:scale-105"
            />
          </AspectRatio>
          {product.featured && (
            <Badge className="absolute top-2 left-2 bg-craft-terracotta hover:bg-craft-terracotta">
              Featured
            </Badge>
          )}
        </div>
        
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-lg line-clamp-1">{product.name}</h3>
            <span className="font-bold text-craft-teal">${product.price.toFixed(2)}</span>
          </div>
          
          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
            {product.description}
          </p>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Star className="h-4 w-4 fill-amber-400 stroke-amber-400 mr-1" />
              <span className="text-sm font-medium">{product.rating.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground ml-1">({product.reviewCount})</span>
            </div>
            <span className="text-xs text-muted-foreground">By {product.vendorName}</span>
          </div>
        </div>
      </Link>
      
      {onAddToCart && (
        <div className="px-4 pb-4">
          <Button 
            onClick={(e) => {
              e.preventDefault();
              onAddToCart();
            }} 
            className="w-full craft-btn-primary"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProductCard;
