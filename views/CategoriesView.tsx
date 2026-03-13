
import React, { useState, useMemo, useEffect } from 'react';
import { CATEGORIES } from '../constants.tsx';
import ProductCard from '../components/ProductCard.tsx';
import { Product, Seller } from '../types.ts';
import { LockClosedIcon, SparklesIcon, GlobeAltIcon, RocketLaunchIcon } from '@heroicons/react/24/outline';

interface CategoriesViewProps {
  products: Product[];
  sellers: Seller[];
  initialSearchQuery?: string;
  onProductClick: (p: Product) => void;
  onAddToCart: (p: Product, e: React.MouseEvent) => void;
}

const CategoriesView: React.FC<CategoriesViewProps> = ({ products, sellers, initialSearchQuery = '', onProductClick, onAddToCart }) => {
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState(initialSearchQuery);

  useEffect(() => {
    setSearchFilter(initialSearchQuery);
  }, [initialSearchQuery]);

  const activeCategory = useMemo(() => 
    CATEGORIES.find(c => c.name === selectedCat), 
    [selectedCat]
  );

  const filteredProducts = useMemo(() => {
    let list = products.filter(
      (p) => p.status === 'approved' && (p.availableQuantity === undefined || p.availableQuantity > 0)
    );
    
    // Filter by keyword if searchFilter exists
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      list = list.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }
    
    // Filter by category
    if (selectedCat) {
      list = list.filter(p => p.category === selectedCat);
    }
    
    return list;
  }, [products, selectedCat, searchFilter]);

  const renderOSWTeaser = () => (
    <div className="bg-[#121212] rounded-[3rem] p-8 md:p-20 text-white relative overflow-hidden animate-in fade-in zoom-in duration-700 border border-violet-500/20 shadow-2xl shadow-violet-500/10">
      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto">
        <div className="w-24 h-24 bg-violet-500/20 rounded-full flex items-center justify-center mb-8 border border-violet-500/30">
          <GlobeAltIcon className="w-12 h-12 text-violet-400 animate-pulse" />
        </div>
        
        <div className="inline-flex items-center gap-2 bg-violet-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 shadow-xl shadow-violet-600/30 border border-violet-400/30">
          <SparklesIcon className="w-3 h-3" />
          UI Testing Phase - Coming Soon
        </div>

        <h2 className="text-4xl md:text-5xl font-black font-poppins mb-6 leading-tight">
          Ortentic Special <span className="text-violet-500">World</span>
        </h2>
        
        <p className="text-zinc-400 text-lg md:text-xl mb-10 leading-relaxed font-medium">
          The ultimate Abuja luxury marketplace experience. Curating the world's most exclusive Grade-A+ foreign used items for the elite.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full text-left">
          <div className="bg-white/5 p-6 rounded-3xl border border-violet-500/10 hover:bg-white/10 transition-colors">
            <RocketLaunchIcon className="w-6 h-6 text-violet-500 mb-3" />
            <h4 className="font-bold text-sm mb-1 text-zinc-100">Hyper-Exclusive Drops</h4>
            <p className="text-xs text-zinc-500">Limited edition inventory that never hits the open market. Only available to OSW members.</p>
          </div>
          <div className="bg-white/5 p-6 rounded-3xl border border-violet-500/10 hover:bg-white/10 transition-colors">
            <LockClosedIcon className="w-6 h-6 text-violet-500 mb-3" />
            <h4 className="font-bold text-sm mb-1 text-zinc-100">Vetted Perfection</h4>
            <p className="text-xs text-zinc-500">Every single OSW item passes a rigorous 150-point inspection by our premium partners.</p>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center gap-4">
          <button className="bg-violet-600 text-white px-10 py-4 rounded-2xl font-black text-sm hover:bg-violet-700 transition-all shadow-2xl shadow-violet-600/20 active:scale-95 border border-violet-400/20">
            Join the Waiting List
          </button>
          <div className="flex items-center gap-2 opacity-50">
            <LockClosedIcon className="w-3 h-3 text-violet-400" />
            <p className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest">Reserved for Premium Members</p>
          </div>
        </div>
      </div>
      
      {/* Dynamic Glow Decor */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/20 rounded-full translate-x-32 -translate-y-32 blur-[100px]"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-900/10 rounded-full -translate-x-16 translate-y-16 blur-[80px]"></div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-60 flex-shrink-0">
          <div className="sticky top-24">
            <h2 className="text-xl font-bold font-poppins mb-6">Marketplace</h2>
            <div className="flex flex-wrap md:flex-col gap-1">
              <button
                onClick={() => setSelectedCat(null)}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all text-left ${
                  selectedCat === null ? 'bg-[#0B1E3F] text-white shadow-md' : 'bg-transparent text-gray-500 hover:bg-gray-100'
                }`}
              >
                All Listings
              </button>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCat(cat.name)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all text-left flex items-center justify-between group ${
                    selectedCat === cat.name 
                      ? (cat.isSpecial ? 'bg-violet-600 text-white shadow-md' : 'bg-[#F44307] text-white shadow-md') 
                      : (cat.isSpecial ? 'bg-zinc-800 text-violet-400 border border-violet-500/20' : 'bg-transparent text-gray-500 hover:bg-gray-100')
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="opacity-70">{React.cloneElement(cat.icon as React.ReactElement<any>, { className: "w-4 h-4" })}</span>
                    {cat.name}
                  </div>
                  {cat.locked && <LockClosedIcon className="w-3 h-3 opacity-50" />}
                </button>
              ))}
            </div>
            
            {searchFilter && (
              <div className="mt-8 p-4 bg-[#F44307]/10 rounded-2xl border border-[#F44307]/20">
                <p className="text-[10px] font-bold text-[#F44307] uppercase tracking-widest mb-1">Search active</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold truncate">"{searchFilter}"</span>
                  <button onClick={() => setSearchFilter('')} className="text-[#F44307] text-xs hover:underline">Clear</button>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Main Grid */}
        <main className="flex-grow">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
            <h1 className={`text-2xl font-bold font-poppins flex items-baseline gap-3 ${activeCategory?.isSpecial ? 'text-violet-600' : ''}`}>
              {activeCategory?.isSpecial ? 'Exclusive Access' : (searchFilter ? 'Search Results' : (selectedCat || 'All Products'))}
              {!activeCategory?.isSpecial && (
                <span className="text-sm font-medium text-gray-400">({filteredProducts.length} verified items)</span>
              )}
            </h1>
          </div>
          
          {activeCategory?.locked ? (
            renderOSWTeaser()
          ) : (
            filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-5 gap-y-12">
                {filteredProducts.map(p => (
                  <ProductCard 
                    key={p.id} 
                    product={p} 
                    sellers={sellers}
                    onClick={onProductClick}
                    onAddToCart={onAddToCart}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-[2rem] p-20 text-center border-2 border-dashed border-gray-100">
                <p className="text-gray-400 font-medium">No items found for your request.</p>
                <p className="text-xs text-gray-300 mt-1">Check your spelling or try a different category!</p>
              </div>
            )
          )}
        </main>
      </div>
    </div>
  );
};

export default CategoriesView;
