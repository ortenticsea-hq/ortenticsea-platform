
import React, { useState, useMemo } from 'react';
import { Review, User } from '../types';
import StarRating from './StarRating';

interface ReviewSectionProps {
  targetId: string;
  targetType: 'product' | 'seller';
  reviews: Review[];
  onAddReview: (rating: number, comment: string) => void;
  currentUser: User | null;
  onLoginPrompt: () => void;
}

const ReviewSection: React.FC<ReviewSectionProps> = ({ 
  targetId, 
  targetType, 
  reviews, 
  onAddReview, 
  currentUser,
  onLoginPrompt
}) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredReviews = useMemo(() => 
    reviews.filter(r => r.targetId === targetId && r.targetType === targetType),
    [reviews, targetId, targetType]
  );

  const { avgRating, distribution } = useMemo(() => {
    if (filteredReviews.length === 0) return { avgRating: 0, distribution: [0, 0, 0, 0, 0] };
    
    const dist = [0, 0, 0, 0, 0]; // 5, 4, 3, 2, 1
    const sum = filteredReviews.reduce((acc, r) => {
      const idx = 5 - Math.round(r.rating);
      if (idx >= 0 && idx < 5) dist[idx]++;
      return acc + r.rating;
    }, 0);
    
    return {
      avgRating: sum / filteredReviews.length,
      distribution: dist.map(count => (count / filteredReviews.length) * 100)
    };
  }, [filteredReviews]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onLoginPrompt();
      return;
    }
    if (!comment.trim()) return;
    
    setIsSubmitting(true);
    // Simulate API delay
    setTimeout(() => {
      onAddReview(rating, comment);
      setComment('');
      setRating(5);
      setIsSubmitting(false);
    }, 600);
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Rating Summary */}
        <div className="w-full md:w-1/3 p-6 bg-orange-50/50 rounded-3xl border border-orange-100/50">
          <h3 className="text-xl font-bold text-[#0B1E3F] mb-4">Customer Satisfaction</h3>
          <div className="flex items-end gap-3 mb-6">
            <span className="text-5xl font-bold text-[#0B1E3F] leading-none">{avgRating.toFixed(1)}</span>
            <div className="flex flex-col">
              <StarRating rating={avgRating} size="md" />
              <span className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">Based on {filteredReviews.length} reviews</span>
            </div>
          </div>
          
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((star, i) => (
              <div key={star} className="flex items-center gap-3 text-sm">
                <span className="w-3 font-bold text-gray-600">{star}</span>
                <div className="flex-grow h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-yellow-400 rounded-full transition-all duration-1000" 
                    style={{ width: `${distribution[i]}%` }}
                  ></div>
                </div>
                <span className="w-8 text-right text-xs text-gray-400 font-medium">{Math.round(distribution[i])}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Review Form */}
        <div className="w-full md:w-2/3 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <h4 className="font-bold text-[#0B1E3F] mb-4 flex items-center gap-2">
            Write a Review
            {!currentUser && <span className="text-xs font-normal text-gray-400">(Sign in required)</span>}
          </h4>
          
          {!currentUser ? (
            <div className="text-center py-6 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/50">
              <p className="text-sm text-gray-500 mb-4">Share your experience with the Abuja community.</p>
              <button 
                onClick={onLoginPrompt}
                className="bg-[#0B1E3F] text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10"
              >
                Sign In to Review
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Your Overall Rating</label>
                <StarRating rating={rating} onRatingChange={setRating} interactive size="md" />
              </div>
              <div>
                <textarea 
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us about the item quality, the seller's communication, and delivery speed..."
                  className="w-full bg-white border border-gray-200 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#F26A21] min-h-[120px] transition-all resize-none shadow-inner"
                  required
                />
              </div>
              <div className="flex justify-end">
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#F26A21] text-white px-10 py-3 rounded-xl font-bold text-sm hover:bg-orange-600 transition-all disabled:opacity-50 shadow-lg shadow-orange-500/20 active:scale-95"
                >
                  {isSubmitting ? 'Posting Review...' : 'Post Review'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Review List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <h4 className="font-bold text-[#0B1E3F]">Community Feedback</h4>
          <span className="text-xs text-gray-400 font-medium">Sorted by: Most Recent</span>
        </div>
        
        {filteredReviews.length === 0 ? (
          <div className="text-center py-16 bg-gray-50/30 rounded-[2.5rem] border border-dashed border-gray-200">
            <p className="text-gray-400 font-medium">No reviews for this {targetType} yet.</p>
            <p className="text-xs text-gray-300 mt-1">Be the first to share your experience!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredReviews.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((review) => (
              <div key={review.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#0B1E3F] to-slate-700 text-white flex items-center justify-center rounded-2xl font-bold shadow-md transform group-hover:rotate-3 transition-transform">
                      {review.userName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-[#0B1E3F]">{review.userName}</p>
                      <div className="flex items-center gap-2">
                        <StarRating rating={review.rating} />
                        <span className="text-[10px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded-full font-bold uppercase">Verified</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">{new Date(review.date).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed italic">
                  "{review.comment}"
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewSection;
