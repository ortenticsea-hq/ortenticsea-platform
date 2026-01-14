
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
    <header className="sticky top-0 z-40 bg-[#0B1E3F] border-b border-white/10 shadow-xl pt-1 md:pt-0">
      <div className="container mx-auto px-4">
        {/* Top Row: Logo, Search (Desktop), Actions */}
        <div className="h-20 flex items-center justify-between gap-4">
          {/* Logo Section */}
          <div 
            className="flex items-center gap-3 cursor-pointer flex-shrink-0" 
            onClick={() => setView('home')}
          >
            <Logo size="md" />
            <div className="hidden lg:flex flex-col -gap-1">
              <span className="font-poppins text-xl font-black text-white leading-tight tracking-tight">
                ORTENTIC<span className="text-[#F26A21]">SEA</span>
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Abuja Verified</span>
            </div>
          </div>

          {/* Primary Search Bar (Desktop) */}
          <div className="hidden md:flex flex-grow max-w-3xl mx-6 mt-[3px]">
            <form onSubmit={handleSearchSubmit} className="flex w-full items-stretch group">
              <div className="relative flex-grow">
                <input 
                  type="text" 
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Search for verified foreign-used items..."
                  className="w-full h-full bg-white/10 border-2 border-white/10 rounded-l-2xl px-12 py-3.5 text-sm font-medium text-white placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-[#F26A21]/10 focus:bg-white/20 focus:border-[#F26A21] transition-all"
                />
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#F26A21] transition-colors" />
              </div>
              <button 
                type="submit"
                className="bg-[#F26A21] hover:bg-orange-600 text-white px-8 py-3.5 rounded-r-2xl font-bold text-sm transition-all shadow-lg active:scale-[0.98] border-2 border-[#F26A21] flex-shrink-0"
              >
                Search
              </button>
            </form>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
            <button 
              onClick={() => setView('chat')}
              className={`p-2.5 rounded-2xl transition-all flex items-center gap-2 border border-transparent ${
                activeView === 'chat' ? 'bg-[#F26A21] text-white' : 'text-slate-300 hover:bg-white/10'
              }`}
              title="O-Assist AI"
            >
              <SparklesIcon className="w-6 h-6" />
              <span className="text-xs font-bold hidden xl:block">O-Assist</span>
            </button>
            
            <button 
              onClick={() => setView('cart')}
              className="p-2.5 rounded-2xl hover:bg-white/10 transition-all text-slate-300 relative group"
              title="Shopping Cart"
            >
              <ShoppingCartIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#F26A21] text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#0B1E3F]">
                  {cartCount}
                </span>
              )}
            </button>

            <button 
              onClick={onProfileClick}
              className={`p-1.5 rounded-2xl border-2 transition-all flex items-center gap-2 ${
                currentUser 
                ? 'border-[#F26A21] bg-[#F26A21]/10 text-white' 
                : 'border-transparent text-slate-300 hover:bg-white/10'
              }`}
            >
              {currentUser ? (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#F26A21] text-white rounded-xl flex items-center justify-center text-xs font-bold">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="hidden md:flex flex-col items-start -gap-1">
                    <span className="text-xs font-bold text-white">{currentUser.name.split(' ')[0]}</span>
                    {currentUser.role === 'admin' && (
                      <span className="text-[8px] font-black text-[#F26A21] uppercase tracking-tighter flex items-center gap-0.5">
                        <ShieldCheckIcon className="w-2 h-2" /> Admin
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-1">
                  <UserIcon className="w-6 h-6" />
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Row */}
        <div className="md:hidden mt-[3px] pb-4">
          <form onSubmit={handleSearchSubmit} className="relative w-full group">
            <input 
              type="text" 
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search verified items..."
              className="w-full bg-white/10 border-2 border-white/5 rounded-[1.25rem] px-12 py-4 text-sm font-semibold text-white placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-[#F26A21]/20 focus:bg-white/20 focus:border-[#F26A21] transition-all"
            />
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#F26A21] transition-colors" />
          </form>
        </div>
      </div>
    </header>
  );
};

export default Header;