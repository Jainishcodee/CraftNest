
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    images: string[];
    rating: number;
    review_count: number;
    featured: boolean;
    stock: number;
  };
  onAddToCart: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    onAddToCart();
  };
  
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-md h-full flex flex-col">
      <div className="relative">
        <Link to={`/product/${product.id}`} className="block">
          <div className="aspect-square overflow-hidden">
            <img
              src={product.images[0]}
              alt={product.name}
              className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
            />
          </div>
        </Link>
        {product.featured && (
          <Badge className="absolute top-2 left-2 bg-craft-terracotta">
            Featured
          </Badge>
        )}
      </div>
      
      <CardContent className="flex-grow p-4">
        <Link to={`/product/${product.id}`} className="block">
          <div className="mb-2">
            <Badge variant="outline" className="mb-2">
              {product.category}
            </Badge>
            <h3 className="font-medium line-clamp-1 text-lg">{product.name}</h3>
          </div>
          
          <p className="text-muted-foreground line-clamp-2 text-sm mb-2">
            {product.description}
          </p>
          
          <div className="flex items-center gap-1 mb-1">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-3 w-3 ${
                    star <= Math.round(product.rating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              ({product.review_count})
            </span>
          </div>
        </Link>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex items-center justify-between mt-auto">
        <div className="font-bold text-craft-teal">
          ${product.price.toFixed(2)}
        </div>
        
        <Button
          size="sm"
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="craft-btn-primary"
        >
          <ShoppingCart className="h-4 w-4 mr-1" />
          {product.stock === 0 ? 'Out of Stock' : 'Add'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
