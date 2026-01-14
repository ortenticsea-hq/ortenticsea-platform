
import React from 'react';
import { User, ViewType } from '../types';
import { 
  UserCircleIcon, 
  ShoppingBagIcon, 
  MapPinIcon, 
  CreditCardIcon, 
  BellIcon, 
  ArrowRightOnRectangleIcon,
  ChevronRightIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

interface ProfileViewProps {
  user: User | null;
  onLogout: () => void;
  onLoginClick: () => void;
  setView: (v: ViewType) => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, onLogout, onLoginClick, setView }) => {
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <UserCircleIcon className="w-12 h-12 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold font-poppins mb-2">Join OrtenticSEA</h2>
        <p className="text-gray-500 mb-8 max-w-xs mx-auto">Sign in to manage your orders, sell items, and track your favorite gadgets.</p>
        <button 
          onClick={onLoginClick}
          className="bg-[#0B1E3F] text-white px-12 py-4 rounded-2xl font-bold shadow-lg hover:bg-slate-800 transition-all"
        >
          Sign In / Register
        </button>
      </div>
    );
  }

  const menuItems = [
    { label: 'My Orders', icon: ShoppingBagIcon, view: 'cart' },
    { label: 'Saved Items', icon: BellIcon, view: 'home' },
    { label: 'Shipping Address', icon: MapPinIcon, view: 'profile' },
    { label: 'Payment Methods', icon: CreditCardIcon, view: 'profile' },
  ];

  const isAdmin = user.role === 'admin';

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm mb-6">
        <div className="flex items-center gap-4 mb-8">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold ${isAdmin ? 'bg-[#0B1E3F] shadow-xl shadow-[#0B1E3F]/20' : 'bg-[#F26A21]'}`}>
            {user.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-bold font-poppins">{user.name}</h1>
            <p className="text-gray-500 text-sm">{user.email}</p>
            <span className={`inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded uppercase ${isAdmin ? 'bg-orange-100 text-[#F26A21]' : 'bg-green-50 text-green-700'}`}>
              {isAdmin ? 'System Administrator' : 'Verified Buyer'}
            </span>
          </div>
        </div>

        {isAdmin && (
          <div className="mb-8">
            <button 
              onClick={() => setView('admin-dashboard')}
              className="w-full flex items-center justify-between p-6 bg-[#0B1E3F] text-white rounded-[1.5rem] shadow-xl shadow-[#0B1E3F]/20 hover:bg-slate-800 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-xl group-hover:scale-110 transition-transform">
                  <ShieldCheckIcon className="w-6 h-6 text-[#F26A21]" />
                </div>
                <div className="text-left">
                  <p className="font-black text-sm uppercase tracking-widest">Control Tower</p>
                  <p className="text-xs text-slate-400">Manage sellers, products & health</p>
                </div>
              </div>
              <ChevronRightIcon className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-gray-50 p-4 rounded-2xl text-center">
            <p className="text-xs text-gray-500 font-medium mb-1">Items Sold</p>
            <p className="text-2xl font-bold">0</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-2xl text-center">
            <p className="text-xs text-gray-500 font-medium mb-1">Purchases</p>
            <p className="text-2xl font-bold">0</p>
          </div>
        </div>

        <div className="space-y-2">
          {menuItems.map((item) => (
            <button 
              key={item.label}
              onClick={() => setView(item.view as ViewType)}
              className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5 text-gray-400 group-hover:text-[#F26A21]" />
                <span className="font-semibold text-[#0B1E3F]">{item.label}</span>
              </div>
              <ChevronRightIcon className="w-4 h-4 text-gray-400" />
            </button>
          ))}
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 p-4 rounded-xl text-red-500 hover:bg-red-50 transition-colors font-semibold"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </div>
      
      {!isAdmin && (
        <div className="bg-[#0B1E3F] rounded-3xl p-8 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-xl font-bold font-poppins mb-2">Sell Your Items</h3>
            <p className="text-blue-100 text-sm mb-6 max-w-[200px]">Have unused quality items? Turn them into cash today.</p>
            <button 
              onClick={() => setView('sell')}
              className="bg-[#F26A21] px-6 py-3 rounded-xl font-bold text-sm hover:bg-orange-600 transition-colors"
            >
              Start Selling
            </button>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#F26A21] rounded-full translate-x-12 -translate-y-12 opacity-20"></div>
        </div>
      )}
    </div>
  );
};

export default ProfileView;