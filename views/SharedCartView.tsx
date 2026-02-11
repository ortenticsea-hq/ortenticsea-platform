import React from 'react';
import { useSharedCart } from '../hooks/useSharedCart';
import { 
  ShoppingBagIcon, 
  LockClosedIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { ViewType } from '../types';

interface SharedCartViewProps {
  shareId: string | null;
  setView: (v: ViewType) => void;
}

const SharedCartView: React.FC<SharedCartViewProps> = ({ shareId, setView }) => {
  const { cart, error, loading } = useSharedCart(shareId);

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#F26A21] border-t-transparent rounded-full animate-spin mb-6"></div>
        <p className="text-gray-500">Loading shared cart...</p>
      </div>
    );
  }

  // Error states
  if (error) {
    const errorConfig = {
      locked: {
        icon: LockClosedIcon,
        title: 'Cart No Longer Available',
        description: 'The owner has revoked access to this shared cart.',
        color: 'text-red-500',
        bgColor: 'bg-red-50',
      },
      expired: {
        icon: ClockIcon,
        title: 'Link Has Expired',
        description: 'This shared cart link has expired. Please request a new link from the owner.',
        color: 'text-orange-500',
        bgColor: 'bg-orange-50',
      },
      'not-found': {
        icon: ExclamationTriangleIcon,
        title: 'Cart Not Found',
        description: 'This shared cart could not be found. The link may be invalid or the cart may have been deleted.',
        color: 'text-gray-500',
        bgColor: 'bg-gray-50',
      },
    };

    const config = errorConfig[error.type];
    const Icon = config.icon;

    return (
      <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center text-center">
        <div className={`w-24 h-24 ${config.bgColor} rounded-full flex items-center justify-center ${config.color} mb-6`}>
          <Icon className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-bold font-poppins mb-2">{config.title}</h2>
        <p className="text-gray-500 mb-8 max-w-md">{config.description}</p>
        <button 
          onClick={() => setView('home')}
          className="bg-[#F26A21] text-white px-8 py-3 rounded-xl font-bold transition-all hover:bg-orange-600"
        >
          Browse Products
        </button>
      </div>
    );
  }

  // No cart data
  if (!cart) {
    return (
      <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-6">
          <ShoppingBagIcon className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-bold font-poppins mb-2">Shared cart is empty</h2>
        <p className="text-gray-500 mb-8 max-w-xs">This shared cart has no items.</p>
        <button 
          onClick={() => setView('home')}
          className="bg-[#F26A21] text-white px-8 py-3 rounded-xl font-bold transition-all hover:bg-orange-600"
        >
          Start Shopping
        </button>
      </div>
    );
  }

  // Calculate total
  const total = cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  // Format expiry date
  const expiryText = cart.expiresAt 
    ? `Expires ${new Date(cart.expiresAt).toLocaleDateString()} at ${new Date(cart.expiresAt).toLocaleTimeString()}`
    : 'No expiration';

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold font-poppins">Shared Shopping Cart</h1>
          <p className="text-gray-500 text-sm mt-1">A friend shared these Abuja finds with you!</p>
          <p className="text-gray-400 text-xs mt-1">{expiryText}</p>
        </div>
      </div>

      {/* Cart Items */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-6">
            {cart.items.map((item) => (
              <div key={item.product.id} className="bg-white p-4 rounded-2xl flex gap-4 border border-gray-100 shadow-sm">
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
                  <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                </div>
                
                <div className="flex-grow">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-[#0B1E3F]">{item.product.name}</h3>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">{item.product.condition}</p>
                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-3 bg-gray-50 px-3 py-1.5 rounded-lg">
                      <span className="text-sm font-bold">Qty: {item.quantity}</span>
                    </div>
                    <p className="text-lg font-bold text-[#F26A21]">
                      ₦{(item.product.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm sticky top-24">
            <h2 className="text-xl font-bold font-poppins mb-6">Cart Summary</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Items ({cart.items.length})</span>
                <span>₦{total.toLocaleString()}</span>
              </div>
              <div className="border-t pt-4 flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-[#F26A21]">₦{total.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-3">
              <button 
                onClick={() => setView('home')}
                className="w-full bg-[#F26A21] text-white py-4 rounded-xl font-bold transition-all hover:bg-orange-600 shadow-lg hover:shadow-xl"
              >
                Browse Similar Items
              </button>
              
              <p className="text-center text-xs text-gray-400">
                View only shared cart mode
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedCartView;
