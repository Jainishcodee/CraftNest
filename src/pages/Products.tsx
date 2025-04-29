import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '@/components/common/ProductCard';
import CategoryFilter from '@/components/common/CategoryFilter';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { SlidersHorizontal, Search, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { supabase } from '@/lib/supabase';
import { useData } from '@/contexts/DataContext';

type ProductCategory = 'pottery' | 'jewelry' | 'woodwork' | 'textiles' | 'art' | 'other';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, addToCart, loadingProducts } = useData();
  
  // Get query params
  const categoryParam = searchParams.get('category') as ProductCategory | null;
  const searchParam = searchParams.get('search') || '';
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState(searchParam);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200]);
  const [sortBy, setSortBy] = useState<'featured' | 'newest' | 'price-asc' | 'price-desc'>('featured');
  const [productCounts, setProductCounts] = useState<Record<ProductCategory, number>>({} as Record<ProductCategory, number>);
  const [maxPrice, setMaxPrice] = useState(200);
  
  // Update product counts and max price whenever products change
  useEffect(() => {
    if (products.length > 0) {
      // Calculate max price
      const highestPrice = Math.max(...products.map(p => p.price), 200);
      setMaxPrice(highestPrice);
      setPriceRange(prev => [prev[0], highestPrice]);
      
      // Calculate product counts by category
      const counts = products.reduce((acc, product) => {
        const category = product.category as ProductCategory;
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {} as Record<ProductCategory, number>);
      
      setProductCounts(counts);
    }
  }, [products]);
  
  // Update search params when filters change
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (searchTerm) {
      params.set('search', searchTerm);
    } else {
      params.delete('search');
    }
    setSearchParams(params);
  }, [searchTerm, setSearchParams, searchParams]);
  
  // Filter and sort products
  const filteredProducts = products
    .filter(product => !categoryParam || product.category === categoryParam)
    .filter(product => 
      searchTerm === '' || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(product => product.price >= priceRange[0] && product.price <= priceRange[1])
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'featured':
        default:
          return b.featured ? 1 : -1;
      }
    });
  
  // Handle add to cart
  const handleAddToCart = (product: any) => {
    addToCart(product, 1);
    toast.success('Added to cart', {
      description: `${product.name} has been added to your cart`,
    });
  };
  
  // Product skeleton for loading state
  const ProductSkeleton = () => (
    <div className="border rounded-lg overflow-hidden">
      <Skeleton className="h-48 w-full" />
      <div className="p-4">
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-6 w-full mb-4" />
        <Skeleton className="h-4 w-32 mb-4" />
        <div className="flex justify-between">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    </div>
  );
  
  return (
    <div className="craft-container py-8 md:py-12">
      <h1 className="craft-heading mb-8">Products</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Mobile filters */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="md:hidden mb-4 w-full">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
              <SheetDescription>
                Refine your product search
              </SheetDescription>
            </SheetHeader>
            
            <div className="py-4 space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Categories</h3>
                <CategoryFilter 
                  selectedCategory={categoryParam} 
                  productCounts={productCounts} 
                />
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Price Range</h3>
                <Slider
                  defaultValue={[0, maxPrice]}
                  min={0}
                  max={maxPrice}
                  step={1}
                  value={priceRange}
                  onValueChange={(value) => setPriceRange(value as [number, number])}
                  className="mb-6"
                />
                <div className="flex justify-between">
                  <span>${priceRange[0]}</span>
                  <span>${priceRange[1]}</span>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Sort By</h3>
                <div className="space-y-2">
                  {[
                    { label: 'Featured', value: 'featured' },
                    { label: 'Newest', value: 'newest' },
                    { label: 'Price: Low to High', value: 'price-asc' },
                    { label: 'Price: High to Low', value: 'price-desc' },
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => setSortBy(option.value as any)}
                      className="flex items-center gap-2 w-full p-2 hover:bg-muted rounded-md"
                    >
                      <div className={`h-4 w-4 rounded-full border ${sortBy === option.value ? 'bg-craft-teal border-craft-teal flex items-center justify-center' : 'border-gray-300'}`}>
                        {sortBy === option.value && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        
        {/* Desktop sidebar */}
        <aside className="hidden md:block w-1/4 space-y-8">
          <div className="sticky top-24">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Categories</h3>
                <CategoryFilter 
                  selectedCategory={categoryParam} 
                  productCounts={productCounts} 
                />
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Price Range</h3>
                <Slider
                  defaultValue={[0, maxPrice]}
                  min={0}
                  max={maxPrice}
                  step={1}
                  value={priceRange}
                  onValueChange={(value) => setPriceRange(value as [number, number])}
                  className="mb-6"
                />
                <div className="flex justify-between">
                  <span>${priceRange[0]}</span>
                  <span>${priceRange[1]}</span>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Sort By</h3>
                <div className="space-y-2">
                  {[
                    { label: 'Featured', value: 'featured' },
                    { label: 'Newest', value: 'newest' },
                    { label: 'Price: Low to High', value: 'price-asc' },
                    { label: 'Price: High to Low', value: 'price-desc' },
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => setSortBy(option.value as any)}
                      className="flex items-center gap-2 w-full p-2 hover:bg-muted rounded-md"
                    >
                      <div className={`h-4 w-4 rounded-full border ${sortBy === option.value ? 'bg-craft-teal border-craft-teal flex items-center justify-center' : 'border-gray-300'}`}>
                        {sortBy === option.value && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>
        
        {/* Main content */}
        <div className="md:w-3/4">
          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Results count */}
          <p className="text-muted-foreground mb-6">
            {loadingProducts 
              ? "Loading products..." 
              : `Showing ${filteredProducts.length} ${filteredProducts.length === 1 ? 'product' : 'products'}`}
          </p>
          
          {/* Products grid */}
          {loadingProducts ? (
            <div className="product-grid">
              {Array(8).fill(0).map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="product-grid">
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={{
                    ...product,
                    review_count: product.reviewCount // Map for compatibility
                  }}
                  onAddToCart={() => handleAddToCart(product)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No products found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
