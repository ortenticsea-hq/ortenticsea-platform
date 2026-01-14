
import React, { useState, useEffect, useCallback } from 'react';
import { 
  FireIcon, 
  SparklesIcon, 
  RocketLaunchIcon, 
  ShoppingBagIcon, 
  ArrowRightIcon,
  Squares2X2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';
import { CATEGORIES, PRODUCTS } from '../constants.tsx';
import ProductCard from '../components/ProductCard.tsx';
import { Product, ViewType } from '../types.ts';

interface HomeProps {
  setView: (v: ViewType) => void;
  onSearch: (q: string) => void;
  onProductClick: (p: Product) => void;
  onAddToCart: (p: Product, e: React.MouseEvent) => void;
}

const Home: React.FC<HomeProps> = ({ setView, onSearch, onProductClick, onAddToCart }) => {
  const trending = PRODUCTS.filter(p => p.isTrending);
  const newArrivals = PRODUCTS.filter(p => p.isNewArrival);
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Auto-slide logic for Hero Carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % trending.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [trending.length]);

  const nextSlide = useCallback(() => {
    setCarouselIndex((prev) => (prev + 1) % trending.length);
  }, [trending.length]);

  const prevSlide = useCallback(() => {
    setCarouselIndex((prev) => (prev - 1 + trending.length) % trending.length);
  }, [trending.length]);

  return (
    <div className="flex flex-col gap-10 pb-12 relative overflow-hidden">
      {/* Hero Section - Themed in Ortentic Orange */}
      <div className="container mx-auto px-4 mt-2 md:mt-4">
        <section className="relative overflow-hidden bg-[#F26A21] rounded-[2.5rem] p-6 lg:p-10 text-white lg:min-h-[380px] lg:max-h-[60vh] flex flex-col justify-center shadow-2xl transition-all duration-500">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            
            {/* Left: Text Content */}
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-white/30 backdrop-blur-sm">
                <SparklesIcon className="w-3.5 h-3.5" />
                Trusted in Abuja
              </div>
              <h1 className="text-3xl md:text-4xl xl:text-5xl font-black mb-4 leading-tight tracking-tight">
                Premium Foreign <br/><span className="text-[#0B1E3F]">Used Items</span>
              </h1>
              <p className="text-white/90 text-base md:text-lg mb-6 max-w-lg leading-relaxed font-medium">
                Abuja's verified marketplace for high-quality grade-A electronics, designer clothing, and appliances.
              </p>
              
              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={() => setView('categories')}
                  className="bg-[#0B1E3F] hover:bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-black text-xs md:text-sm transition-all flex items-center justify-center gap-2 shadow-xl shadow-black/20 active:scale-95"
                >
                  <span>Browse Marketplace</span>
                  <ArrowRightIcon className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setView('sell')}
                  className="bg-white/20 hover:bg-white/30 text-white border border-white/40 px-8 py-3.5 rounded-2xl font-black text-xs md:text-sm transition-all flex items-center justify-center gap-2 backdrop-blur-md active:scale-95"
                >
                  <span>Become a Seller</span>
                </button>
              </div>
            </div>

            {/* Right: Trending Carousel (Visible on Large Screens) */}
            <div className="hidden lg:block relative group">
              <div className="relative w-full aspect-[16/10] rounded-[1.5rem] overflow-hidden shadow-2xl border border-white/20 bg-white/10 backdrop-blur-sm">
                {trending.map((product, idx) => (
                  <div 
                    key={product.id}
                    className={`absolute inset-0 transition-all duration-700 ease-in-out cursor-pointer ${
                      idx === carouselIndex ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-8 scale-95 pointer-events-none'
                    }`}
                    onClick={() => onProductClick(product)}
                  >
                    <img 
                      src={product.images[0]} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    {/* Overlay Info */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0B1E3F]/90 via-[#0B1E3F]/40 to-transparent p-6 pt-16">
                      <div className="flex justify-between items-end">
                        <div>
                          <span className="text-[9px] font-black uppercase tracking-widest text-[#F26A21] mb-1 block">Trending Now</span>
                          <h3 className="text-lg font-bold text-white line-clamp-1">{product.name}</h3>
                          <p className="text-white/70 text-[10px]">{product.condition}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-black text-white">₦{product.price.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Navigation Buttons */}
                <div className="absolute inset-x-3 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
                  <button 
                    onClick={(e) => { e.stopPropagation(); prevSlide(); }}
                    className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-[#0B1E3F] transition-all pointer-events-auto shadow-xl group/btn active:scale-90"
                  >
                    <ChevronLeftIcon className="w-5 h-5 text-white group-hover/btn:scale-110" />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                    className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-[#0B1E3F] transition-all pointer-events-auto shadow-xl group/btn active:scale-90"
                  >
                    <ChevronRightIcon className="w-5 h-5 text-white group-hover/btn:scale-110" />
                  </button>
                </div>

                {/* Dots Indicators */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {trending.map((_, idx) => (
                    <button 
                      key={idx}
                      onClick={(e) => { e.stopPropagation(); setCarouselIndex(idx); }}
                      className={`h-1 rounded-full transition-all duration-300 ${
                        idx === carouselIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/30'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Subtle background decoration */}
          <div className="absolute left-[-20px] bottom-[-20px] p-4 opacity-10 pointer-events-none scale-110">
            <ShoppingBagIcon className="w-64 h-64 -rotate-12" />
          </div>
          <div className="absolute right-[-20px] top-[-20px] p-4 opacity-5 pointer-events-none scale-110">
            <SparklesIcon className="w-48 h-48 rotate-45" />
          </div>
        </section>
      </div>

      {/* Categories */}
      <section className="container mx-auto px-4">
        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
          <Squares2X2Icon className="w-5 h-5 text-[#F26A21]" />
          Browse Categories
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setView('categories')}
              className={`p-4 rounded-xl flex flex-col items-center gap-3 border transition-all group shadow-sm hover:shadow-md relative overflow-hidden ${
                cat.isSpecial 
                  ? 'bg-[#121212] border-violet-500/30' 
                  : (cat.locked ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-100 hover:border-[#F26A21]')
              }`}
            >
              <div className={`p-3 rounded-lg transition-colors ${
                cat.isSpecial
                  ? 'bg-violet-500/10 text-violet-400 group-hover:text-violet-300'
                  : (cat.locked ? 'bg-slate-200 text-slate-400' : 'bg-slate-50 text-[#0B1E3F] group-hover:text-[#F26A21]')
              }`}>
                {React.cloneElement(cat.icon as React.ReactElement<any>, { className: "w-6 h-6" })}
              </div>
              <span className={`font-semibold text-xs transition-colors ${
                cat.isSpecial
                  ? 'text-violet-400 group-hover:text-violet-300'
                  : (cat.locked ? 'text-slate-400' : 'text-slate-600 group-hover:text-[#F26A21]')
              }`}>
                {cat.name}
              </span>
              {cat.locked && (
                <div className={`absolute top-2 right-2 ${cat.isSpecial ? 'text-violet-500/50' : 'text-slate-400'}`}>
                  <LockClosedIcon className="w-3 h-3" />
                </div>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Trending Products Section */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <FireIcon className="w-5 h-5 text-[#F26A21]" />
            Trending Products
          </h2>
          <button 
            onClick={() => setView('categories')}
            className="text-sm font-semibold text-[#F26A21] hover:underline"
          >
            View All
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {trending.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onClick={onProductClick}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      </section>

      {/* New Arrivals */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <RocketLaunchIcon className="w-5 h-5 text-[#F26A21]" />
            New Arrivals
          </h2>
          <button 
            onClick={() => setView('categories')}
            className="text-sm font-semibold text-[#F26A21] hover:underline"
          >
            Browse New
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {newArrivals.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onClick={onProductClick}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      </section>

      {/* Marketplace Trust Banner */}
      <section className="container mx-auto px-4">
        <div className="bg-[#0B1E3F] rounded-3xl p-10 flex flex-col md:flex-row items-center justify-between gap-8 text-white relative overflow-hidden">
          <div className="relative z-10 flex-grow">
            <h3 className="text-2xl font-black mb-3">Verified Sellers Only</h3>
            <p className="text-slate-400 text-sm max-w-lg leading-relaxed">Every merchant on OrtenticSEA undergoes identity verification to ensure safe transactions. No scams, just quality grade-A items.</p>
          </div>
          <button 
            onClick={() => setView('sell')}
            className="relative z-10 bg-white text-[#0B1E3F] px-10 py-4 rounded-2xl font-black text-sm whitespace-nowrap hover:bg-[#F26A21] hover:text-white transition-all shadow-xl active:scale-95"
          >
            Apply to Sell
          </button>
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#F26A21] rounded-full translate-x-32 -translate-y-32 opacity-10"></div>
        </div>
      </section>
    </div>
  );
};

export default Home;
