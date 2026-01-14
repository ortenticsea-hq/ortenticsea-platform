
import React, { useState } from 'react';
import { Product, Seller, Review, User, ViewType } from '../types';
import { SELLERS } from '../constants';
import VerifiedBadge from '../components/VerifiedBadge';
import StarRating from '../components/StarRating';
import ReviewSection from '../components/ReviewSection';
import { ChevronLeftIcon, StarIcon, ShieldCheckIcon, TruckIcon } from '@heroicons/react/24/solid';

interface ProductDetailViewProps {
  product: Product;
  reviews: Review[];
  currentUser: User | null;
  onBack: () => void;
  onAddToCart: (p: Product) => void;
  onAddReview: (rating: number, comment: string) => void;
  onLoginPrompt: () => void;
  onSellerClick: (s: Seller) => void;
}

const ProductDetailView: React.FC<ProductDetailViewProps> = ({ 
  product, 
  reviews, 
  currentUser,
  onBack, 
  onAddToCart,
  onAddReview,
  onLoginPrompt,
  onSellerClick
}) => {
  const [activeImage, setActiveImage] = useState(0);
  const seller = SELLERS.find(s => s.id === product.sellerId);

  const productReviews = reviews.filter(r => r.targetId === product.id && r.targetType === 'product');
  const avgRating = productReviews.length > 0 
    ? productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length 
    : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <button 
        onClick={onBack}
        className="flex items-center gap-1 text-sm font-semibold text-[#0B1E3F] mb-6 hover:text-[#F26A21]"
      >
        <ChevronLeftIcon className="w-4 h-4" />
        Back to Products
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        {/* Gallery */}
        <div className="space-y-4">
          <div className="aspect-square bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm">
            <img 
              src={product.images[activeImage]} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                  activeImage === i ? 'border-[#F26A21]' : 'border-transparent opacity-60'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <div className="mb-8">
            <span className="text-xs font-bold text-[#F26A21] uppercase tracking-widest">{product.category}</span>
            <h1 className="text-3xl md:text-4xl font-bold font-poppins mt-2 mb-2">{product.name}</h1>
            
            <div className="flex items-center gap-2 mb-4">
              <StarRating rating={avgRating} />
              <span className="text-xs font-bold text-gray-500">
                {avgRating.toFixed(1)} ({productReviews.length} reviews)
              </span>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <span className="text-2xl font-bold text-[#F26A21]">₦{product.price.toLocaleString()}</span>
              <span className="bg-gray-100 px-3 py-1 rounded-full text-xs font-bold text-gray-600 uppercase">
                {product.condition}
              </span>
            </div>
            
            <p className="text-gray-600 leading-relaxed mb-8">
              {product.description}
            </p>
            
            <button 
              onClick={() => onAddToCart(product)}
              className="w-full md:w-auto px-12 py-4 bg-[#F26A21] text-white font-bold rounded-2xl shadow-lg hover:bg-orange-600 transition-all transform hover:-translate-y-1"
            >
              Add to Cart
            </button>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-8">
            <h3 className="font-bold mb-4 text-[#0B1E3F]">Seller Information</h3>
            {seller && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center font-bold text-[#0B1E3F]">
                    {seller.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <p className="font-semibold text-sm">{seller.name}</p>
                      {seller.isVerified && <VerifiedBadge />}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <StarIcon className="w-3 h-3 text-yellow-500" />
                      {seller.rating} • {seller.reviewCount} reviews
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => onSellerClick(seller)}
                  className="text-sm font-semibold text-[#F26A21] hover:underline"
                >
                  View Shop
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 bg-green-50 rounded-2xl">
              <ShieldCheckIcon className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-bold text-green-900">Buyer Protection</p>
                <p className="text-xs text-green-700">Verified and tested items.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-2xl">
              <TruckIcon className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-bold text-blue-900">Abuja Delivery</p>
                <p className="text-xs text-blue-700">Fast local pickup/delivery.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review Section */}
      <section className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm max-w-4xl">
        <ReviewSection 
          targetId={product.id}
          targetType="product"
          reviews={reviews}
          onAddReview={onAddReview}
          currentUser={currentUser}
          onLoginPrompt={onLoginPrompt}
        />
      </section>
    </div>
  );
};

export default ProductDetailView;
