
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      onSearch(searchValue);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0B1E3F] border-b border-white/10 shadow-2xl">
      <div className="container mx-auto px-6 lg:px-8">
        {/* Top Row: Logo, Search (Desktop), Actions */}
        <div className="h-24 flex items-center justify-between gap-8">
          {/* Logo Section */}
          <div 
            className="flex items-center gap-3 cursor-pointer flex-shrink-0 hover:opacity-80 transition-opacity" 
            onClick={() => setView('home')}
          >
            <Logo size="md" />
          </div>

          {/* Search Bar - Centered */}
          <form onSubmit={handleSearchSubmit} className="hidden lg:flex items-center gap-0 flex-1 max-w-xl group">
            <div className="relative flex-1">
              <input 
                type="text" 
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search for verified foreign-used items..."
                className="w-full bg-white/10 border-2 border-white/15 rounded-l-2xl px-12 py-3 text-sm font-medium text-white placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-[#F26A21]/20 focus:bg-white/20 focus:border-[#F26A21] transition-all"
              />
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#F26A21] transition-colors" />
            </div>
            <button 
              type="submit"
              className="bg-[#F26A21] hover:bg-orange-600 text-white px-7 py-3 rounded-r-2xl font-bold text-sm transition-all shadow-lg hover:shadow-orange-500/20 active:scale-[0.98] border-2 border-[#F26A21] flex-shrink-0"
            >
              Search
            </button>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-3 md:gap-5 flex-shrink-0">
            <button 
              onClick={() => setView('chat')}
              className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 border font-semibold text-sm ${
                activeView === 'chat' ? 'bg-[#F26A21] text-white border-[#F26A21] shadow-lg shadow-orange-500/20' : 'text-slate-300 border-white/20 hover:bg-white/10 hover:border-white/30'
              }`}
              title="O-Assist AI"
            >
              <SparklesIcon className="w-5 h-5" />
              <span className="hidden xl:inline">O-Assist</span>
            </button>
            
            <button 
              onClick={() => setView('cart')}
              className="px-3 py-2.5 rounded-xl hover:bg-white/10 transition-all text-slate-300 hover:text-white relative group border border-white/20 hover:border-white/30"
              title="Shopping Cart"
            >
              <ShoppingCartIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#F26A21] text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#0B1E3F] shadow-lg">
                  {cartCount}
                </span>
              )}
            </button>

            <button 
              onClick={onProfileClick}
              className={`px-3 py-2 rounded-xl border-2 transition-all flex items-center gap-2.5 font-medium ${
                currentUser 
                ? 'border-[#F26A21] bg-[#F26A21]/15 text-white hover:bg-[#F26A21]/25 shadow-lg shadow-orange-500/10' 
                : 'border-white/20 text-slate-300 hover:bg-white/10 hover:border-white/30'
              }`}
            >
              {currentUser ? (
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-[#F26A21] text-white rounded-lg flex items-center justify-center text-xs font-bold">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="hidden lg:flex flex-col items-start gap-0.5">
                    <span className="text-xs font-bold text-white leading-none">{currentUser.name.split(' ')[0]}</span>
                    {currentUser.role === 'admin' && (
                      <span className="text-[7px] font-black text-[#F26A21] uppercase tracking-tight flex items-center gap-0.5 leading-none">
                        <ShieldCheckIcon className="w-2 h-2" /> Admin
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <UserIcon className="w-5 h-5" />
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
              className="w-full bg-white/10 border-2 border-white/15 rounded-xl px-11 py-3 text-sm font-medium text-white placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-[#F26A21]/20 focus:bg-white/20 focus:border-[#F26A21] transition-all"
            />
            <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#F26A21] transition-colors" />
          </form>
        </div>
      </div>
    </header>
  );
};

export default Header;