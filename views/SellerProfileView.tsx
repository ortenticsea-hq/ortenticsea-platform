
import React, { useMemo, useRef } from 'react';
import { Seller, Product, Review, User, ViewType } from '../types';
import VerifiedBadge from '../components/VerifiedBadge';
import StarRating from '../components/StarRating';
import ProductCard from '../components/ProductCard';
import ReviewSection from '../components/ReviewSection';
import { 
  ChevronLeftIcon, 
  CalendarIcon, 
  ShoppingBagIcon, 
  ChatBubbleBottomCenterTextIcon,
  SparklesIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface SellerProfileViewProps {
  seller: Seller;
  products: Product[];
  reviews: Review[];
  currentUser: User | null;
  onBack: () => void;
  onProductClick: (p: Product) => void;
  onAddToCart: (p: Product, e: React.MouseEvent) => void;
  onAddReview: (rating: number, comment: string) => void;
  onLoginPrompt: () => void;
  setView: (v: ViewType) => void;
}

const SellerProfileView: React.FC<SellerProfileViewProps> = ({ 
  seller, 
  products, 
  reviews, 
  currentUser,
  onBack, 
  onProductClick, 
  onAddToCart,
  onAddReview,
  onLoginPrompt,
  setView
}) => {
  const reviewSectionRef = useRef<HTMLDivElement>(null);

  // Filter products belonging to this seller
  const sellerProducts = useMemo(() => 
    products.filter(p => p.sellerId === seller.id), 
    [products, seller.id]
  );

  // Calculate live review metrics
  const { avgRating, totalReviews } = useMemo(() => {
    const filtered = reviews.filter(r => r.targetId === seller.id && r.targetType === 'seller');
    const avg = filtered.length > 0 
      ? filtered.reduce((sum, r) => sum + r.rating, 0) / filtered.length 
      : 0;
    return {
      avgRating: avg,
      totalReviews: filtered.length
    };
  }, [reviews, seller.id]);

  const scrollToReviews = () => {
    reviewSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const currentDisplayRating = avgRating > 0 ? avgRating : seller.rating;
  const currentReviewCount = totalReviews > 0 ? totalReviews : seller.reviewCount;

  return (
    <div className="container mx-auto px-4 py-8">
      <button 
        onClick={onBack}
        className="flex items-center gap-1 text-sm font-semibold text-[#0B1E3F] mb-8 hover:text-[#F26A21] group transition-colors"
      >
        <ChevronLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Marketplace
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 md:gap-12">
        {/* Sidebar Info */}
        <aside className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm text-center relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#F26A21]/5 rounded-full translate-x-16 -translate-y-16 -z-0"></div>
            
            <div className="relative z-10">
              <div className="w-24 h-24 bg-gradient-to-br from-[#0B1E3F] to-slate-700 rounded-3xl flex items-center justify-center mx-auto mb-6 text-3xl font-bold text-white shadow-xl rotate-3">
                {seller.name.charAt(0)}
              </div>
              <div className="flex items-center justify-center gap-2 mb-3">
                <h1 className="text-xl font-bold font-poppins">{seller.name}</h1>
                {seller.isVerified && <VerifiedBadge />}
              </div>
              
              <div className="flex flex-col items-center gap-1 mb-6">
                <div className="flex items-center gap-2">
                  <StarRating rating={currentDisplayRating} size="sm" />
                  <span className="font-bold text-lg text-[#0B1E3F]">
                    {currentDisplayRating.toFixed(1)}
                  </span>
                </div>
                <button 
                  onClick={scrollToReviews}
                  className="text-gray-400 text-[10px] font-bold uppercase tracking-wider hover:text-[#F26A21] transition-colors"
                >
                  {currentReviewCount} Feedbacks
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 py-6 border-y border-gray-100 mb-6">
                <div className="flex flex-col items-center justify-center bg-gray-50/50 p-3 rounded-2xl">
                  <ShoppingBagIcon className="w-4 h-4 text-[#0B1E3F] mb-1" />
                  <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Inventory</span>
                  <span className="font-bold text-xs">{sellerProducts.length} Items</span>
                </div>
                <div className="flex flex-col items-center justify-center bg-gray-50/50 p-3 rounded-2xl">
                  <CalendarIcon className="w-4 h-4 text-[#0B1E3F] mb-1" />
                  <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Joined</span>
                  <span className="font-bold text-xs">{seller.joinDate || '2023'}</span>
                </div>
              </div>

              <div className="text-left mb-8">
                <p className="text-xs text-gray-500 leading-relaxed italic bg-blue-50/30 p-4 rounded-2xl">
                  "{seller.description || 'Verified OrtenticSEA Abuja seller providing quality high-value used items.'}"
                </p>
              </div>

              <button 
                onClick={scrollToReviews}
                className="w-full flex items-center justify-center gap-2 bg-[#0B1E3F] text-white py-4 rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg active:scale-95"
              >
                <ChatBubbleBottomCenterTextIcon className="w-5 h-5" />
                Review Store
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="lg:col-span-3 space-y-12">
          {/* Seller Stats Header Bar */}
          <section className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-8">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Store Rating</span>
                <div className="flex items-center gap-2">
                   <StarRating rating={currentDisplayRating} />
                   <span className="font-bold text-lg">{currentDisplayRating.toFixed(1)}</span>
                </div>
              </div>
              <div className="w-px h-10 bg-gray-100"></div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Listings</span>
                <span className="font-bold text-lg">{sellerProducts.length} Items</span>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-full text-xs font-bold">
               <CheckCircleIcon className="w-4 h-4" />
               Verified Abuja Merchant
            </div>
          </section>

          {/* Seller Products */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold font-poppins">Available Stock</h2>
              <div className="h-px flex-grow mx-6 bg-gray-100 hidden md:block"></div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                {sellerProducts.length} Items
              </span>
            </div>
            
            {sellerProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
                {sellerProducts.map(p => (
                  <ProductCard 
                    key={p.id} 
                    product={p} 
                    onClick={onProductClick} 
                    onAddToCart={onAddToCart} 
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-[2.5rem] p-16 text-center border-2 border-dashed border-gray-100 text-gray-300">
                <ShoppingBagIcon className="w-12 h-12 mx-auto mb-4" />
                <p className="font-medium">Store currently refreshing inventory.</p>
              </div>
            )}
          </section>

          {/* Seller Reviews Section */}
          <section 
            ref={reviewSectionRef}
            className="bg-white rounded-[2.5rem] p-6 md:p-12 border border-gray-100 shadow-sm scroll-mt-24"
          >
            <ReviewSection 
              targetId={seller.id}
              targetType="seller"
              reviews={reviews}
              currentUser={currentUser}
              onAddReview={onAddReview}
              onLoginPrompt={onLoginPrompt}
            />
          </section>
        </main>
      </div>
    </div>
  );
};

export default SellerProfileView;
