
import React from 'react';
import { useData } from '@/contexts/DataContext';
import { Star, User } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import ReviewForm from './ReviewForm';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

interface ProductReviewsProps {
  productId: string;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ productId }) => {
  const { reviews } = useData();
  const { user, isAuthenticated } = useAuth();
  const [showForm, setShowForm] = React.useState(false);
  
  const productReviews = reviews.filter(review => review.productId === productId);
  
  const hasReviewed = productReviews.some(review => review.customerId === user?.id);
  
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
            }}
          />
        </div>
      )}
      
      {productReviews.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">
          This product has no reviews yet. Be the first to leave a review!
        </p>
      ) : (
        <div className="space-y-6">
          {productReviews.map(review => (
            <div key={review.id} className="space-y-2">
              <div className="flex justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">{review.customerName}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString()}
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
