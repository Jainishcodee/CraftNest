
import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData, ProductCategory } from '@/contexts/DataContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Upload, X, ArrowLeft } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';

const productSchema = z.object({
  name: z.string().min(2, { message: 'Product name must be at least 2 characters' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters' }),
  price: z.coerce.number().min(0.1, { message: 'Price must be greater than 0' }),
  category: z.enum(['pottery', 'jewelry', 'woodwork', 'textiles', 'art', 'other']),
  stock: z.coerce.number().int().min(1, { message: 'Stock must be at least 1' }),
  featured: z.boolean().default(false),
});

const ProductUpload = () => {
  const { user, isAuthenticated } = useAuth();
  const { addProduct } = useData();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('/placeholder.svg');
  
  // Redirect if user is not a vendor
  if (!isAuthenticated || user?.role !== 'vendor') {
    return <Navigate to="/login" />;
  }
  
  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      category: 'pottery',
      stock: 1,
      featured: false,
    },
  });
  
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (file) {
      // In a real app, this would upload to a server
      // Here we just create an object URL for preview
      const imageUrl = URL.createObjectURL(file);
      setImagePreview(imageUrl);
    }
  };
  
  const onSubmit = async (data: z.infer<typeof productSchema>) => {
    if (!user) return;
    
    try {
      setIsSubmitting(true);
      
      // In a real app, you would upload images to a server
      // Here we just use the placeholder image
      await addProduct({
        name: data.name,
        description: data.description,
        price: data.price,
        category: data.category as ProductCategory,
        vendorId: user.id,
        vendorName: user.name,
        images: [imagePreview],
        rating: 0,
        reviewCount: 0,
        featured: data.featured,
        stock: data.stock,
      });
      
      // Notify admin about new product
      addNotification({
        title: 'New Product Submission',
        message: `${user.name} has submitted a new product "${data.name}" for approval.`,
        type: 'warning',
        forRole: 'admin',
      });
      
      toast.success('Product submitted', {
        description: 'Your product has been submitted for approval.',
      });
      
      navigate('/vendor');
    } catch (error) {
      toast.error('Error', {
        description: 'Failed to submit product. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="craft-container py-8 md:py-12 max-w-3xl">
      <Button variant="ghost" onClick={() => navigate('/vendor')} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>
      
      <div className="mb-8">
        <h1 className="craft-heading">Upload New Product</h1>
        <p className="text-muted-foreground">
          Fill out the form below to submit your product for approval.
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left column - Image upload */}
            <div>
              <div className="border rounded-lg p-4">
                <Label htmlFor="picture" className="text-base font-medium block mb-3">Product Image</Label>
                
                <div className="aspect-square mb-4 bg-muted rounded-md overflow-hidden relative">
                  <img
                    src={imagePreview}
                    alt="Product preview"
                    className="w-full h-full object-cover"
                  />
                  
                  {imagePreview !== '/placeholder.svg' && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => setImagePreview('/placeholder.svg')}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove image</span>
                    </Button>
                  )}
                </div>
                
                <div className="flex justify-center">
                  <Label
                    htmlFor="picture"
                    className="cursor-pointer flex items-center justify-center gap-2 text-sm font-medium w-full py-2 rounded-md border border-dashed border-muted-foreground/50 hover:bg-muted transition-colors"
                  >
                    <Upload className="h-4 w-4" />
                    {imagePreview === '/placeholder.svg' ? 'Upload Image' : 'Change Image'}
                    <Input
                      id="picture"
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handleImageChange}
                    />
                  </Label>
                </div>
                
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Recommended: Square image, at least 800×800 pixels
                </p>
              </div>
            </div>
            
            {/* Right column - Product details */}
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Handmade Ceramic Bowl" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your product in detail..."
                        className="resize-none min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pottery">Pottery</SelectItem>
                        <SelectItem value="jewelry">Jewelry</SelectItem>
                        <SelectItem value="woodwork">Woodwork</SelectItem>
                        <SelectItem value="textiles">Textiles</SelectItem>
                        <SelectItem value="art">Art</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Featured Product
                      </FormLabel>
                      <FormDescription>
                        Featured products appear on the homepage and get more visibility
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button
              type="submit"
              className="craft-btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit for Approval'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ProductUpload;
