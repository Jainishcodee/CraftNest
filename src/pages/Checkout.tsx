
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { CreditCard, Banknote, ShoppingBag, Check } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';

const CheckoutSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Invalid email address' }),
  phone: z.string().min(10, { message: 'Phone number must be at least 10 characters' }),
  address: z.string().min(5, { message: 'Address must be at least 5 characters' }),
  city: z.string().min(2, { message: 'City must be at least 2 characters' }),
  state: z.string().min(2, { message: 'State must be at least 2 characters' }),
  zipCode: z.string().min(5, { message: 'Zip code must be at least 5 characters' }),
  country: z.string().min(2, { message: 'Country must be at least 2 characters' }),
  paymentMethod: z.enum(['credit_card', 'cash_on_delivery']),
  cardNumber: z.string().optional(),
  cardName: z.string().optional(),
  cardExpiry: z.string().optional(),
  cardCvv: z.string().optional(),
});

const Checkout = () => {
  const { cart, clearCart, createOrder } = useData();
  const { user, isAuthenticated } = useAuth();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'shipping' | 'payment' | 'confirmation'>('shipping');
  
  const form = useForm<z.infer<typeof CheckoutSchema>>({
    resolver: zodResolver(CheckoutSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States',
      paymentMethod: 'credit_card',
      cardNumber: '',
      cardName: '',
      cardExpiry: '',
      cardCvv: '',
    },
  });
  
  const watchPaymentMethod = form.watch('paymentMethod');
  
  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login', {
        description: 'You need to be logged in to checkout',
      });
      navigate('/login?redirect=/checkout');
    }
  }, [isAuthenticated, navigate]);
  
  // Redirect to cart if cart is empty
  React.useEffect(() => {
    if (cart.length === 0) {
      toast.error('Empty cart', {
        description: 'Your cart is empty. Add some products before checking out.',
      });
      navigate('/cart');
    }
  }, [cart, navigate]);
  
  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const shipping = 5.99;
  const total = subtotal + shipping;
  
  const handleNextStep = () => {
    if (step === 'shipping') {
      setStep('payment');
    } else if (step === 'payment') {
      handleSubmit();
    }
  };
  
  const handlePrevStep = () => {
    if (step === 'payment') {
      setStep('shipping');
    } else if (step === 'confirmation') {
      navigate('/cart');
    }
  };
  
  const handleSubmit = async () => {
    if (!user) return;
    
    try {
      setIsSubmitting(true);
      
      const values = form.getValues();
      const shippingAddress = `${values.address}, ${values.city}, ${values.state}, ${values.zipCode}, ${values.country}`;
      
      // For each product in cart, create an order for its vendor
      const vendorOrders: Record<string, typeof cart> = {};
      
      // Group cart items by vendor
      cart.forEach(item => {
        const vendorId = item.product.vendorId;
        if (!vendorOrders[vendorId]) {
          vendorOrders[vendorId] = [];
        }
        vendorOrders[vendorId].push(item);
      });
      
      // Create orders for each vendor
      for (const [vendorId, items] of Object.entries(vendorOrders)) {
        const vendorName = items[0].product.vendorName;
        const orderTotal = items.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        );
        
        const orderId = await createOrder({
          customerId: user.id,
          customerName: user.name,
          vendorId,
          vendorName,
          products: items.map(item => ({
            productId: item.product.id,
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
          })),
          total: orderTotal,
          status: 'pending',
          shippingAddress,
          paymentMethod: values.paymentMethod === 'credit_card' ? 'Credit Card' : 'Cash on Delivery',
        });
        
        // Generate notification for vendor
        addNotification({
          title: 'New Order',
          message: `You have received a new order (#${orderId.slice(-5)}) from ${user.name}.`,
          type: 'success',
          forRole: 'vendor',
        });
      }
      
      // Generate notification for customer
      addNotification({
        title: 'Order Placed',
        message: `Your order has been placed successfully and is being processed.`,
        type: 'success',
        forRole: 'customer',
      });
      
      clearCart();
      setStep('confirmation');
    } catch (error) {
      toast.error('Error', {
        description: 'There was an error processing your order. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // If no user or cart is empty, don't render checkout
  if (!user || cart.length === 0) {
    return null;
  }
  
  // Render confirmation page if order is completed
  if (step === 'confirmation') {
    return (
      <div className="craft-container py-8 md:py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="h-16 w-16 mx-auto mb-6 bg-craft-sage/20 rounded-full flex items-center justify-center">
            <Check className="h-8 w-8 text-craft-sage" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Order Confirmed!</h1>
          <p className="text-muted-foreground mb-8">
            Thank you for your order. We've sent a confirmation email with your order details.
          </p>
          <div className="space-y-4">
            <Button asChild className="craft-btn-primary w-full">
              <a href="/customer">View Orders</a>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <a href="/">Continue Shopping</a>
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="craft-container py-8 md:py-12">
      <h1 className="craft-heading mb-8">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout form */}
        <div className="lg:col-span-2">
          <Form {...form}>
            <form className="space-y-6">
              {/* Shipping information */}
              <Accordion
                type="single"
                collapsible
                value={step === 'shipping' ? 'shipping' : undefined}
              >
                <AccordionItem value="shipping">
                  <AccordionTrigger className="text-lg font-medium">
                    Shipping Information
                  </AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="email@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input placeholder="(123) 456-7890" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="md:col-span-2">
                        <FormField
                          control={form.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Address</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Street address"
                                  className="resize-none"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input placeholder="City" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State/Province</FormLabel>
                            <FormControl>
                              <Input placeholder="State" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="zipCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ZIP/Postal Code</FormLabel>
                            <FormControl>
                              <Input placeholder="12345" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select country" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="United States">United States</SelectItem>
                                <SelectItem value="Canada">Canada</SelectItem>
                                <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                                <SelectItem value="Australia">Australia</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="mt-6 flex justify-end">
                      <Button
                        type="button"
                        onClick={() => {
                          form.trigger([
                            'name',
                            'email',
                            'phone',
                            'address',
                            'city',
                            'state',
                            'zipCode',
                            'country',
                          ]);
                          
                          const isValid = !form.formState.errors.name &&
                                        !form.formState.errors.email &&
                                        !form.formState.errors.phone &&
                                        !form.formState.errors.address &&
                                        !form.formState.errors.city &&
                                        !form.formState.errors.state &&
                                        !form.formState.errors.zipCode &&
                                        !form.formState.errors.country;
                                        
                          if (isValid) {
                            setStep('payment');
                          }
                        }}
                        className="craft-btn-primary"
                      >
                        Continue to Payment
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              
              {/* Payment information */}
              <Accordion
                type="single"
                collapsible
                value={step === 'payment' ? 'payment' : undefined}
              >
                <AccordionItem value="payment">
                  <AccordionTrigger className="text-lg font-medium">
                    Payment Method
                  </AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="space-y-3"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="credit_card" id="credit_card" />
                                <Label htmlFor="credit_card" className="flex items-center">
                                  <CreditCard className="h-5 w-5 mr-2" />
                                  Credit Card
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="cash_on_delivery" id="cash_on_delivery" />
                                <Label htmlFor="cash_on_delivery" className="flex items-center">
                                  <Banknote className="h-5 w-5 mr-2" />
                                  Cash on Delivery
                                </Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {watchPaymentMethod === 'credit_card' && (
                      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <FormField
                            control={form.control}
                            name="cardNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Card Number</FormLabel>
                                <FormControl>
                                  <Input placeholder="**** **** **** ****" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="cardName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cardholder Name</FormLabel>
                              <FormControl>
                                <Input placeholder="John Doe" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="cardExpiry"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Expiry Date</FormLabel>
                                <FormControl>
                                  <Input placeholder="MM/YY" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="cardCvv"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>CVV</FormLabel>
                                <FormControl>
                                  <Input placeholder="***" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-6 flex justify-between">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setStep('shipping')}
                      >
                        Back
                      </Button>
                      <Button
                        type="button"
                        onClick={handleSubmit}
                        className="craft-btn-primary"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Processing...' : 'Place Order'}
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </form>
          </Form>
        </div>
        
        {/* Order summary */}
        <div>
          <div className="border rounded-lg p-6 bg-white sticky top-24">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              {cart.map(item => (
                <div key={item.product.id} className="flex gap-3">
                  <div className="w-16 h-16 bg-muted rounded flex-shrink-0">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between">
                      <p className="font-medium">{item.product.name}</p>
                      <p className="font-bold text-craft-teal">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Qty: {item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <Separator className="my-4" />
            
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
            
            <div className="flex justify-between font-bold text-lg">
              <p>Total</p>
              <p>${total.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
