
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';

interface ReviewFormProps {
  productId: string;
  onSuccess: () => void;
}

const FormSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(5, { message: 'Review comment must be at least 5 characters' }),
});

const ReviewForm: React.FC<ReviewFormProps> = ({ productId, onSuccess }) => {
  const { user } = useAuth();
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      rating: 0,
      comment: '',
    },
  });
  
  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    if (!user) return;
    
    try {
      setIsSubmitting(true);
      
      // Insert review into Supabase
      const { error } = await supabase.from('reviews').insert({
        product_id: productId,
        customer_id: user.id,
        customer_name: user.name,
        rating: data.rating,
        comment: data.comment,
        created_at: new Date().toISOString(),
      });
      
      if (error) {
        throw error;
      }
      
      // Update product rating in Supabase
      // First get all reviews for this product
      const { data: productReviews, error: reviewsError } = await supabase
        .from('reviews')
        .select('rating')
        .eq('product_id', productId);
      
      if (!reviewsError && productReviews) {
        // Calculate average rating
        const avgRating = 
          productReviews.reduce((sum, review) => sum + review.rating, 0) / productReviews.length;
        
        // Update product with new rating and review count
        await supabase
          .from('products')
          .update({ 
            rating: avgRating, 
            review_count: productReviews.length 
          })
          .eq('id', productId);
      }
      
      toast({
        title: 'Review submitted',
        description: 'Your review has been submitted successfully.',
      });
      
      form.reset();
      onSuccess();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to submit review. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const watchedRating = form.watch('rating');
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rating</FormLabel>
              <FormControl>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => field.onChange(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          star <= (hoveredRating || field.value)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-gray-300'
                        } transition-all`}
                      />
                      <span className="sr-only">{star} stars</span>
                    </button>
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Review</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Share your experience with this product..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button
          type="submit"
          className="craft-btn-primary"
          disabled={watchedRating === 0 || isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </Button>
      </form>
    </Form>
  );
};

export default ReviewForm;
