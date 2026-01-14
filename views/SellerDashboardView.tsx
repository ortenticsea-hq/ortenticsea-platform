
import React from 'react';
import { 
  BuildingStorefrontIcon, 
  CheckBadgeIcon, 
  ClockIcon, 
  PlusCircleIcon,
  ShoppingBagIcon,
  ArrowTrendingUpIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  WrenchScrewdriverIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { User, Product } from '../types';

interface SellerDashboardViewProps {
  user: User;
  products: Product[];
  onCreateProduct: () => void;
  onRefreshStatus: () => void;
  onOpenTools: () => void;
}

const SellerDashboardView: React.FC<SellerDashboardViewProps> = ({ user, products, onCreateProduct, onRefreshStatus, onOpenTools }) => {
  const sellerProducts = products.filter(p => p.sellerId === user.id);

  if (user.sellerStatus === 'pending') {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-8 text-blue-500 animate-pulse">
          <ClockIcon className="w-12 h-12" />
        </div>
        <h1 className="text-3xl font-bold font-poppins text-[#0B1E3F]">Application Pending</h1>
        <p className="text-gray-500 mt-4 max-w-md mx-auto">
          Hang tight! Our Abuja team is currently verifying your documents. We'll notify you as soon as your shop is live.
        </p>
        <button 
          onClick={onRefreshStatus}
          className="mt-8 flex items-center gap-2 mx-auto text-[#F26A21] font-bold text-sm hover:underline"
        >
          <ArrowPathIcon className="w-4 h-4" />
          Refresh Status
        </button>
      </div>
    );
  }

  if (user.sellerStatus === 'rejected') {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8 text-red-500">
          <ExclamationCircleIcon className="w-12 h-12" />
        </div>
        <h1 className="text-3xl font-bold font-poppins text-[#0B1E3F]">Verification Declined</h1>
        <div className="mt-4 p-6 bg-red-50 text-red-700 rounded-3xl max-w-md mx-auto border border-red-100">
          <p className="text-sm font-bold uppercase mb-1">Reason for Rejection:</p>
          <p className="text-sm">{user.rejectionReason || 'Documents provided were unclear or invalid.'}</p>
        </div>
        <button className="mt-8 bg-[#0B1E3F] text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all">
          Re-apply with New Documents
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Stat Cards */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-[#0B1E3F] rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-xl">
            {user.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold font-poppins text-[#0B1E3F]">{user.name}</h1>
              <span className="bg-green-50 text-green-600 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border border-green-100 flex items-center gap-1">
                <CheckBadgeIcon className="w-3 h-3" />
                Verified Merchant
              </span>
            </div>
            <p className="text-gray-400 text-sm">Abuja Central • Active since {new Date().getFullYear()}</p>
          </div>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={onOpenTools}
            className="flex-1 md:flex-none border-2 border-[#0B1E3F] text-[#0B1E3F] px-6 py-4 rounded-2xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
          >
            <WrenchScrewdriverIcon className="w-6 h-6" />
            Business Tools
          </button>
          <button 
            onClick={onCreateProduct}
            className="flex-1 md:flex-none bg-[#F26A21] text-white px-6 py-4 rounded-2xl font-bold shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-all flex items-center justify-center gap-2"
          >
            <PlusCircleIcon className="w-6 h-6" />
            List New Item
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 text-gray-400 mb-2">
            <ShoppingBagIcon className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest">Marketplace Items</span>
          </div>
          <p className="text-3xl font-bold text-[#0B1E3F]">{sellerProducts.length}</p>
          <p className="text-xs text-green-500 mt-2 font-medium">Items live in Abuja</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 text-gray-400 mb-2">
            <ArrowTrendingUpIcon className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest">Shop Rating</span>
          </div>
          <p className="text-3xl font-bold text-[#0B1E3F]">4.9</p>
          <p className="text-xs text-gray-400 mt-2 font-medium">Based on 12 verified reviews</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm bg-gradient-to-br from-[#0B1E3F] to-slate-800 text-white border-none">
          <div className="flex items-center gap-3 opacity-60 mb-2">
            <BuildingStorefrontIcon className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest">Store Health</span>
          </div>
          <p className="text-3xl font-bold">Excellent</p>
          <p className="text-xs opacity-60 mt-2 font-medium">All KYC verified</p>
        </div>
      </div>

      {/* Tools Promo Banner */}
      <div 
        onClick={onOpenTools}
        className="bg-orange-50 rounded-[2.5rem] p-8 mb-12 border-2 border-dashed border-orange-200 cursor-pointer group hover:bg-orange-100 transition-all"
      >
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-16 h-16 bg-[#F26A21] text-white rounded-[1.5rem] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <SparklesIcon className="w-8 h-8" />
          </div>
          <div className="flex-grow text-center md:text-left">
            <h3 className="text-xl font-bold text-[#0B1E3F]">Independent Business Suite</h3>
            <p className="text-sm text-[#0B1E3F]/60 mt-1">Track your offline store sales, calculate true net profit, and manage your stock room—all in one place.</p>
          </div>
          <button className="bg-[#0B1E3F] text-white px-8 py-3 rounded-xl text-sm font-bold shadow-xl shadow-slate-900/10">
            Open Tools
          </button>
        </div>
      </div>

      {/* Inventory Section */}
      <section>
        <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
          <h2 className="text-xl font-bold font-poppins text-[#0B1E3F]">Marketplace Listings</h2>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{sellerProducts.length} Items Listed</span>
        </div>
        
        {sellerProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sellerProducts.map(p => (
              <div key={p.id} className="bg-white p-4 rounded-3xl border border-gray-100 flex gap-4 hover:shadow-md transition-all group">
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0">
                  <img src={p.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                </div>
                <div className="flex-grow py-1">
                  <h4 className="font-bold text-[#0B1E3F] text-sm mb-1">{p.name}</h4>
                  <p className="text-xs text-[#F26A21] font-bold mb-2">₦{p.price.toLocaleString()}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-green-50 text-green-600">Live</span>
                    <button className="text-[10px] font-bold text-gray-400 hover:text-[#0B1E3F]">Edit</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200">
            <ShoppingBagIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400 font-medium">No items listed yet.</p>
            <button 
              onClick={onCreateProduct}
              className="mt-4 text-[#F26A21] font-bold text-sm"
            >
              Post your first Grade-A item
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default SellerDashboardView;
