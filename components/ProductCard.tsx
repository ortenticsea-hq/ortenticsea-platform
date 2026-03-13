
import React from 'react';
import { Product, Seller } from '../types.ts';
import VerifiedBadge from './VerifiedBadge.tsx';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';

interface ProductCardProps {
  product: Product;
  sellers?: Seller[];
  onClick: (p: Product) => void;
  onAddToCart: (p: Product, e: React.MouseEvent) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, sellers = [], onClick, onAddToCart }) => {
  const seller = sellers.find(s => s.id === product.sellerId);

  return (
    <div 
      onClick={() => onClick(product)}
      className="group cursor-pointer flex flex-col h-full bg-transparent transition-all duration-500 ease-out hover:scale-[1.03] hover:shadow-2xl hover:shadow-orange-500/10 hover:bg-white hover:p-3 -m-3 m-[3px] rounded-[2rem] z-0 hover:z-10"
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100 mb-3 shadow-sm group-hover:shadow-none transition-shadow">
        <img 
          src={product.images[0]} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
        
        {/* Condition Tag */}
        <div className="absolute top-3 left-3">
          <span className="bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter text-[#0B1E3F] shadow-sm">
            {product.condition}
          </span>
        </div>

        {/* Quick Add to Cart Button (Mobile visible, Desktop hover) */}
        <button 
          onClick={(e) => onAddToCart(product, e)}
          className="absolute bottom-3 right-3 w-10 h-10 bg-white/95 backdrop-blur-sm text-[#F26A21] rounded-full flex items-center justify-center shadow-lg transform transition-all duration-300 md:opacity-0 md:translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 active:scale-90 hover:bg-[#F26A21] hover:text-white"
          aria-label="Add to cart"
        >
          <ShoppingCartIcon className="w-5 h-5" />
        </button>
      </div>
      
      {/* Product Details */}
      <div className="flex flex-col flex-grow px-1">
        <div className="flex justify-between items-start gap-2 mb-0.5">
          <h3 className="font-semibold text-[15px] text-[#0B1E3F] line-clamp-1 group-hover:text-[#F26A21] transition-colors">
            {product.name}
          </h3>
          {seller?.isVerified && <VerifiedBadge />}
        </div>
        
        <p className="text-gray-500 text-[13px] mb-1 line-clamp-1">
          {seller ? seller.name : product.category}
        </p>
        
        <div className="mt-auto flex items-baseline gap-1">
          <span className="font-bold text-[#0B1E3F] text-[15px]">
            ₦{product.price.toLocaleString()}
          </span>
          <span className="text-[11px] text-gray-400 font-medium">Abuja</span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
