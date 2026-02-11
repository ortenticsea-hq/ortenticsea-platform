
import React, { useState } from 'react';
import Logo from './Logo.tsx';
import { ShoppingCartIcon, UserIcon, MagnifyingGlassIcon, SparklesIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { ViewType } from '../types.ts';

interface HeaderProps {
  activeView: ViewType;
  setView: (v: ViewType) => void;
  onSearch: (query: string) => void;
  cartCount: number;
  currentUser: any;
  onProfileClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ activeView, setView, onSearch, cartCount, currentUser, onProfileClick }) => {
  const [searchValue, setSearchValue] = useState('');
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      onSearch(searchValue);
      setIsMobileSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-neutral-100 border-b border-neutral-200 shadow-sm">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        {/* Top Row: Logo, Search (Desktop), Actions */}
        <div className="h-20 md:h-24 flex items-center justify-between gap-4 md:gap-8">
          {/* Logo Section */}
          <div 
            className="flex items-center gap-3 cursor-pointer flex-shrink-0 hover:opacity-80 transition-opacity" 
            onClick={() => setView('home')}
          >
            <div className="md:hidden">
              <Logo size="sm" />
            </div>
            <div className="hidden md:block">
              <Logo size="md" />
            </div>
          </div>

          {/* Search Bar - Centered */}
          <form onSubmit={handleSearchSubmit} className="hidden lg:flex items-center gap-0 flex-1 max-w-xl group">
            <div className="relative flex-1">
              <input 
                type="text" 
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search for verified foreign-used items..."
                className="w-full bg-white border-2 border-slate-200 rounded-l-2xl px-12 py-3 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-[#F44307]/20 focus:bg-white focus:border-[#F44307] transition-all"
              />
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#F44307] transition-colors" />
            </div>
            <button 
              type="submit"
              className="bg-[#F44307] hover:bg-[#D83A06] text-white px-7 py-3 rounded-r-2xl font-bold text-sm transition-all shadow-lg hover:shadow-[#F44307]/20 active:scale-[0.98] border-2 border-[#F44307] flex-shrink-0"
            >
              Search
            </button>
          </form>

          {/* Actions */} 
          <div className="flex items-center gap-2 md:gap-5 flex-shrink-0">
            <button 
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className={`lg:hidden p-2 rounded-xl transition-all border ${
                isMobileSearchOpen 
                  ? 'bg-[#F44307] text-white border-[#F44307]' 
                  : 'text-slate-600 border-slate-200 hover:bg-white bg-white/50'
              }`}
            >
              <MagnifyingGlassIcon className="w-5 h-5" />
            </button>
            
            <button 
              onClick={() => setView('chat')}
              className={`px-3 md:px-4 py-2 md:py-2.5 rounded-xl transition-all flex items-center gap-2 border font-semibold text-sm ${
                activeView === 'chat' ? 'bg-[#F44307] text-white border-[#F44307] shadow-lg shadow-[#F44307]/20' : 'text-slate-600 border-slate-200 hover:bg-white hover:border-slate-300 bg-white/50'
              }`}
              title="O-Assist AI"
            >
              <SparklesIcon className="w-5 h-5" />
              <span className="hidden xl:inline">O-Assist</span>
            </button>
            
            <button 
              onClick={() => setView('cart')}
              className="px-2.5 md:px-3 py-2 md:py-2.5 rounded-xl hover:bg-white transition-all text-slate-600 hover:text-slate-900 relative group border border-slate-200 hover:border-slate-300 bg-white/50"
              title="Shopping Cart"
            >
              <ShoppingCartIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 md:-top-2 md:-right-2 bg-[#F44307] text-white text-[9px] md:text-[10px] font-black w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center border-2 border-[#0B1E3F] shadow-lg">
                  {cartCount}
                </span>
              )}
            </button>

            <button 
              onClick={onProfileClick}
              className={`px-2.5 md:px-3 py-2 rounded-xl border-2 transition-all flex items-center gap-2.5 font-medium ${
                currentUser 
                ? 'border-[#F44307] bg-[#F44307]/10 text-slate-800 hover:bg-[#F44307]/20 shadow-lg shadow-[#F44307]/10' 
                : 'border-slate-200 text-slate-600 hover:bg-white hover:border-slate-300 bg-white/50 hover:text-[#F44307]'
              }`}
            >
              {currentUser ? (
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 md:w-7 md:h-7 bg-[#F44307] text-white rounded-lg flex items-center justify-center text-xs font-bold">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="hidden lg:flex flex-col items-start gap-0.5">
                    <span className="text-xs font-bold text-slate-800 leading-none">{currentUser.name.split(' ')[0]}</span>
                    {currentUser.role === 'admin' && (
                      <span className="text-[7px] font-black text-[#F44307] uppercase tracking-tight flex items-center gap-0.5 leading-none">
                        <ShieldCheckIcon className="w-2 h-2" /> Admin
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <UserIcon className="w-5 h-5" />
                  <span className="hidden md:inline text-sm font-bold">Sign Up / Login</span>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Row */}
        <div className="lg:hidden pb-4 pt-2">
          <form onSubmit={handleSearchSubmit} className="relative w-full group">
            <input 
              type="text" 
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search verified items..."
              className="w-full bg-white border-2 border-slate-200 rounded-xl px-11 py-3 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-[#F44307]/20 focus:bg-white focus:border-[#F44307] transition-all"
            />
            <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#F44307] transition-colors" />
          </form>
        </div>
        {isMobileSearchOpen && (
          <div className="lg:hidden pb-4 pt-2 animate-in slide-in-from-top-2">
            <form onSubmit={handleSearchSubmit} className="relative w-full group">
              <input 
                type="text" 
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search verified items..."
                autoFocus
                className="w-full bg-white border-2 border-slate-200 rounded-xl px-11 py-3 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-[#F44307]/20 focus:bg-white focus:border-[#F44307] transition-all"
              />
              <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#F44307] transition-colors" />
            </form>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;