
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductCategory } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CategoryFilterProps {
  selectedCategory: ProductCategory | null;
  productCounts: Record<ProductCategory, number>;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ selectedCategory, productCounts }) => {
  const navigate = useNavigate();
  
  const categories: { id: ProductCategory; name: string }[] = [
    { id: 'pottery', name: 'Pottery' },
    { id: 'jewelry', name: 'Jewelry' },
    { id: 'woodwork', name: 'Woodwork' },
    { id: 'textiles', name: 'Textiles' },
    { id: 'art', name: 'Art' },
    { id: 'other', name: 'Other' },
  ];
  
  const handleCategoryClick = (category: ProductCategory | null) => {
    if (category) {
      navigate(`/products?category=${category}`);
    } else {
      navigate('/products');
    }
  };
  
  return (
    <div className="flex flex-wrap gap-2">
      <Button 
        variant={selectedCategory === null ? "default" : "outline"}
        className={selectedCategory === null ? "bg-craft-teal hover:bg-craft-teal/90" : ""}
        onClick={() => handleCategoryClick(null)}
      >
        All
        <Badge variant="secondary" className="ml-2 bg-background text-foreground">
          {Object.values(productCounts).reduce((a, b) => a + b, 0)}
        </Badge>
      </Button>
      
      {categories.map((category) => (
        <Button 
          key={category.id}
          variant={selectedCategory === category.id ? "default" : "outline"}
          className={selectedCategory === category.id ? "bg-craft-teal hover:bg-craft-teal/90" : ""}
          onClick={() => handleCategoryClick(category.id)}
          disabled={!productCounts[category.id]}
        >
          {category.name}
          <Badge variant="secondary" className="ml-2 bg-background text-foreground">
            {productCounts[category.id] || 0}
          </Badge>
        </Button>
      ))}
    </div>
  );
};

export default CategoryFilter;
