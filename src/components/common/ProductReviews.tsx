
import React, { useState, useEffect } from 'react';
import { Star, User } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import ReviewForm from './ReviewForm';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

interface Review {
  id: string;
  product_id: string;
  customer_id: string;
  customer_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface ProductReviewsProps {
  productId: string;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ productId }) => {
  const { user, isAuthenticated } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchReviews = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select('*')
          .eq('product_id', productId)
          .order('created_at', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        setReviews(data || []);
      } catch (error) {
        console.error('Error fetching reviews:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load product reviews.',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchReviews();
  }, [productId, toast]);
  
  const hasReviewed = reviews.some(review => review.customer_id === user?.id);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Customer Reviews</h3>
        
        {isAuthenticated && user?.role === 'customer' && !hasReviewed && (
          <Button
            onClick={() => setShowForm(prev => !prev)}
            className={showForm ? "craft-btn-secondary" : "craft-btn-primary"}
          >
            {showForm ? 'Cancel' : 'Write a Review'}
          </Button>
        )}
      </div>
      
      {showForm && (
        <div className="bg-muted p-4 rounded-lg mb-6">
          <h4 className="text-lg font-medium mb-4">Your Review</h4>
          <ReviewForm 
            productId={productId} 
            onSuccess={() => {
              setShowForm(false);
              // Refresh reviews after submission
              const fetchReviews = async () => {
                const { data } = await supabase
                  .from('reviews')
                  .select('*')
                  .eq('product_id', productId)
                  .order('created_at', { ascending: false });
                
                if (data) setReviews(data);
              };
              fetchReviews();
            }}
          />
        </div>
      )}
      
      {isLoading ? (
        <div className="text-center py-4">
          <p>Loading reviews...</p>
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">
          This product has no reviews yet. Be the first to leave a review!
        </p>
      ) : (
        <div className="space-y-6">
          {reviews.map(review => (
            <div key={review.id} className="space-y-2">
              <div className="flex justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">{review.customer_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < review.rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm">{review.comment}</p>
              <Separator className="mt-4" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductReviews;
