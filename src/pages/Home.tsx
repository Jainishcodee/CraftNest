
import React from 'react';
import { Link } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { ArrowRight, ShoppingBag, Heart, Shield, TrendingUp } from 'lucide-react';
import ProductCard from '@/components/common/ProductCard';
import { toast } from 'sonner';

const Home = () => {
  const { products, addToCart } = useData();
  
  // Filter approved and featured products
  const featuredProducts = products
    .filter(product => product.approved && product.featured)
    .slice(0, 4);
  
  // Get recent products
  const recentProducts = products
    .filter(product => product.approved)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 8);
  
  // Handle add to cart
  const handleAddToCart = (product: typeof products[0]) => {
    addToCart(product, 1);
    toast.success('Added to cart', {
      description: `${product.name} has been added to your cart`,
    });
  };
  
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-craft-teal/10 to-craft-cream">
        <div className="craft-container py-16 md:py-24">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 space-y-6 mb-8 md:mb-0">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-craft-brown animate-fade-in">
                Discover Handcrafted <span className="text-craft-teal">Treasures</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-md animate-fade-in" style={{animationDelay: "0.1s"}}>
                Explore unique, handmade items crafted with love by independent artisans from around the world.
              </p>
              <div className="flex gap-4 animate-fade-in" style={{animationDelay: "0.2s"}}>
                <Button asChild className="craft-btn-primary">
                  <Link to="/products">Shop Now</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/login?role=vendor">Sell Your Crafts</Link>
                </Button>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center md:justify-end animate-slide-in" style={{animationDelay: "0.3s"}}>
              <img
                src="/placeholder.svg"
                alt="Craft items collection"
                className="rounded-lg shadow-lg max-w-full h-auto"
                width={500}
                height={400}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="craft-section">
        <div className="craft-container">
          <div className="flex justify-between items-center mb-8">
            <h2 className="craft-heading">Featured Products</h2>
            <Button asChild variant="outline">
              <Link to="/products">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={() => handleAddToCart(product)}
              />
            ))}
          </div>
          
          {featuredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No featured products available</p>
            </div>
          )}
        </div>
      </section>

      {/* Categories */}
      <section className="bg-muted craft-section">
        <div className="craft-container">
          <h2 className="craft-heading text-center mb-12">Shop by Category</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: 'Pottery', icon: '/placeholder.svg', slug: 'pottery' },
              { name: 'Jewelry', icon: '/placeholder.svg', slug: 'jewelry' },
              { name: 'Woodwork', icon: '/placeholder.svg', slug: 'woodwork' },
              { name: 'Textiles', icon: '/placeholder.svg', slug: 'textiles' },
              { name: 'Art', icon: '/placeholder.svg', slug: 'art' },
              { name: 'Other', icon: '/placeholder.svg', slug: 'other' },
            ].map(category => (
              <Link
                key={category.slug}
                to={`/products?category=${category.slug}`}
                className="bg-white rounded-lg p-4 text-center hover:shadow-md transition-all hover:-translate-y-1"
              >
                <div className="h-16 w-16 mx-auto mb-4 bg-craft-teal/10 rounded-full flex items-center justify-center">
                  <img
                    src={category.icon}
                    alt={category.name}
                    className="h-8 w-8"
                  />
                </div>
                <h3 className="font-medium text-craft-brown">{category.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Products */}
      <section className="craft-section">
        <div className="craft-container">
          <div className="flex justify-between items-center mb-8">
            <h2 className="craft-heading">New Arrivals</h2>
            <Button asChild variant="outline">
              <Link to="/products">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          <div className="product-grid">
            {recentProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={() => handleAddToCart(product)}
              />
            ))}
          </div>
          
          {recentProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No products available</p>
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="bg-craft-cream craft-section">
        <div className="craft-container">
          <h2 className="craft-heading text-center">Why Choose CraftNest</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="bg-white p-6 rounded-lg text-center shadow-sm">
              <div className="h-12 w-12 mx-auto mb-4 bg-craft-teal/10 rounded-full flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-craft-teal" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Unique Products</h3>
              <p className="text-muted-foreground">
                Discover one-of-a-kind items you won't find anywhere else
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg text-center shadow-sm">
              <div className="h-12 w-12 mx-auto mb-4 bg-craft-teal/10 rounded-full flex items-center justify-center">
                <Heart className="h-6 w-6 text-craft-teal" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Support Artisans</h3>
              <p className="text-muted-foreground">
                Every purchase directly supports independent craftspeople
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg text-center shadow-sm">
              <div className="h-12 w-12 mx-auto mb-4 bg-craft-teal/10 rounded-full flex items-center justify-center">
                <Shield className="h-6 w-6 text-craft-teal" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Quality Guaranteed</h3>
              <p className="text-muted-foreground">
                All products are reviewed and approved for quality assurance
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="craft-section bg-craft-teal text-white">
        <div className="craft-container text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Start Selling Your Crafts Today</h2>
            <p className="text-lg mb-8 text-white/80">
              Join our community of artisans and share your handmade creations with customers worldwide
            </p>
            <Button asChild size="lg" variant="outline" className="bg-transparent text-white hover:bg-white hover:text-craft-teal">
              <Link to="/login?role=vendor">Become a Seller</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
