
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

const Cart = () => {
  const { cart, addToCart, clearCart } = useData();
  const navigate = useNavigate();
  
  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  
  const shipping = subtotal > 0 ? 5.99 : 0;
  const total = subtotal + shipping;
  
  const handleQuantityChange = (productId: string, newQuantity: number) => {
    const item = cart.find(item => item.product.id === productId);
    if (item) {
      // Remove item if quantity is 0
      if (newQuantity === 0) {
        removeItem(productId);
        return;
      }
      
      // Don't allow more than available stock
      if (newQuantity > item.product.stock) {
        toast.error("Can't add more", {
          description: `Only ${item.product.stock} items available in stock`,
        });
        return;
      }
      
      // Calculate quantity difference and add to cart (can be negative)
      const difference = newQuantity - item.quantity;
      addToCart(item.product, difference);
    }
  };
  
  const removeItem = (productId: string) => {
    // Find the item
    const itemIndex = cart.findIndex(item => item.product.id === productId);
    if (itemIndex > -1) {
      const newCart = [...cart];
      newCart.splice(itemIndex, 1);
      // Update cart
      clearCart();
      newCart.forEach(item => {
        addToCart(item.product, item.quantity);
      });
      toast.success('Item removed', {
        description: 'The item has been removed from your cart',
      });
    }
  };
  
  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error('Empty cart', {
        description: 'Your cart is empty. Add some products before checking out.',
      });
      return;
    }
    
    navigate('/checkout');
  };
  
  return (
    <div className="craft-container py-8 md:py-12">
      <h1 className="craft-heading mb-8">Your Shopping Cart</h1>
      
      {cart.length === 0 ? (
        <div className="text-center py-16">
          <div className="mb-6 flex justify-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
              <ShoppingBag className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
          <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
          <p className="text-muted-foreground mb-8">
            Looks like you haven't added any products to your cart yet.
          </p>
          <Button asChild className="craft-btn-primary">
            <a href="/products">Start Shopping</a>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {cart.map(item => (
                <div key={item.product.id} className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg bg-white">
                  <div className="sm:w-1/4">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-full h-auto object-cover rounded-md"
                    />
                  </div>
                  <div className="flex-grow space-y-2">
                    <div className="flex justify-between">
                      <h3 className="font-medium">{item.product.name}</h3>
                      <p className="font-bold text-craft-teal">
                        ${item.product.price.toFixed(2)}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {item.product.description}
                    </p>
                    <div className="flex justify-between items-center mt-4">
                      <div className="flex items-center border rounded-md">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Input
                          type="number"
                          min={1}
                          max={item.product.stock}
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.product.id, parseInt(e.target.value) || 1)}
                          className="w-12 text-center border-0 p-0"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.product.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="border rounded-lg p-6 bg-white">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <p>Subtotal</p>
                  <p>${subtotal.toFixed(2)}</p>
                </div>
                <div className="flex justify-between">
                  <p>Shipping</p>
                  <p>${shipping.toFixed(2)}</p>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="flex justify-between font-bold mb-6">
                <p>Total</p>
                <p>${total.toFixed(2)}</p>
              </div>
              
              <Button 
                onClick={handleCheckout}
                className="craft-btn-primary w-full" 
                size="lg"
              >
                Checkout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                className="w-full mt-4"
                onClick={() => {
                  clearCart();
                  toast.success('Cart cleared', {
                    description: 'All items have been removed from your cart',
                  });
                }}
              >
                Clear Cart
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
