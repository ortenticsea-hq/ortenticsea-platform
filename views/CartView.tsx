
import React, { useState } from 'react';
import { CartItem, ViewType } from '../types';
import { 
  ShoppingBagIcon, 
  TrashIcon, 
  MinusIcon, 
  PlusIcon, 
  ArrowRightIcon, 
  ShareIcon, 
  CheckIcon,
  LockClosedIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { User } from '../types';
import { SharedCartService } from '../services/sharedCartService';

interface CartViewProps {
  items: CartItem[];
  onRemove: (id: string) => void;
  onUpdateQty: (id: string, delta: number) => void;
  onCheckout: () => void;
  setView: (v: ViewType) => void;
  currentUser?: User | null;
  onLoginRequired?: () => void;
}

const CartView: React.FC<CartViewProps> = ({ 
  items, 
  onRemove, 
  onUpdateQty, 
  onCheckout, 
  setView,
  currentUser,
  onLoginRequired
}) => {
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [currentShareId, setCurrentShareId] = useState<string | null>(null);
  const total = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  /**
   * Create a new shared cart snapshot
   * Uses production-grade SharedCartService
   */
  const handleShare = async () => {
    if (!currentUser) {
      onLoginRequired?.();
      return;
    }

    if (items.length === 0) {
      alert('Cannot share an empty cart');
      return;
    }

    setSharing(true);

    try {
      // Create shared cart snapshot in Firestore
      const shareId = await SharedCartService.createSharedCart(
        currentUser.id,
        items,
        24 // 24 hours expiry
      );

      // Generate shareable URL
      const shareUrl = SharedCartService.generateShareUrl(shareId);

      // Copy to clipboard
      await navigator.clipboard.writeText(shareUrl);

      // Store share ID for management
      setCurrentShareId(shareId);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      console.error('Error sharing cart:', error);
      alert('Failed to create share link. Please try again.');
    } finally {
      setSharing(false);
    }
  };

  /**
   * Lock the current shared cart (revoke access)
   */
  const handleLockShare = async () => {
    if (!currentShareId || !currentUser) return;

    if (!confirm('Are you sure you want to revoke access to this shared cart? This action cannot be undone.')) {
      return;
    }

    try {
      await SharedCartService.lockSharedCart(currentShareId, currentUser.id);
      setCurrentShareId(null);
      alert('Shared cart access has been revoked');
    } catch (error) {
      console.error('Error locking shared cart:', error);
      alert('Failed to revoke access. Please try again.');
    }
  };

  /**
   * Regenerate a new share link (invalidates old one)
   */
  const handleRegenerateLink = async () => {
    if (!currentShareId || !currentUser) return;

    if (!confirm('This will create a new link and invalidate the old one. Continue?')) {
      return;
    }

    setSharing(true);

    try {
      const newShareId = await SharedCartService.regenerateShareLink(
        currentShareId,
        currentUser.id,
        items,
        24
      );

      const shareUrl = SharedCartService.generateShareUrl(newShareId);
      await navigator.clipboard.writeText(shareUrl);

      setCurrentShareId(newShareId);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      console.error('Error regenerating link:', error);
      alert('Failed to regenerate link. Please try again.');
    } finally {
      setSharing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-6">
          <ShoppingBagIcon className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-bold font-poppins mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-8 max-w-xs">Looks like you haven't added any quality items to your cart yet.</p>
        <button 
          onClick={() => setView('home')}
          className="bg-[#F44307] text-white px-8 py-3 rounded-xl font-bold transition-all hover:bg-[#D83A06]"
        >
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold font-poppins">Shopping Cart</h1>
        </div>
        
        {/* Share Controls */}
        <div className="flex gap-2">
          <button 
            onClick={handleShare}
            disabled={sharing}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-sm ${
              copied ? 'bg-green-500 text-white' : 'bg-white border border-[#F44307] text-[#F44307] hover:bg-[#F44307]/10'
            } ${sharing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {sharing ? (
              <>
                <div className="w-5 h-5 border-2 border-[#F44307] border-t-transparent rounded-full animate-spin"></div>
                Creating Link...
              </>
            ) : copied ? (
              <>
                <CheckIcon className="w-5 h-5" />
                Link Copied!
              </>
            ) : (
              <>
                <ShareIcon className="w-5 h-5" />
                Share Cart
              </>
            )}
          </button>

          {currentShareId && (
            <>
              <button 
                onClick={handleRegenerateLink}
                disabled={sharing}
                className="flex items-center gap-2 px-4 py-3 rounded-2xl font-bold text-sm transition-all shadow-sm bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                title="Generate new link (invalidates old one)"
              >
                <ArrowPathIcon className="w-5 h-5" />
              </button>
              
              <button 
                onClick={handleLockShare}
                className="flex items-center gap-2 px-4 py-3 rounded-2xl font-bold text-sm transition-all shadow-sm bg-white border border-red-300 text-red-600 hover:bg-red-50"
                title="Revoke access to shared cart"
              >
                <LockClosedIcon className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-6">
            {items.map((item) => (
              <div key={item.product.id} className="bg-white p-4 rounded-2xl flex gap-4 border border-gray-100 shadow-sm transition-all hover:shadow-md">
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
                  <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                </div>
                
                <div className="flex-grow">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-[#0B1E3F]">{item.product.name}</h3>
                    <button onClick={() => onRemove(item.product.id)} className="text-gray-400 hover:text-red-500">
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">{item.product.condition}</p>
                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-3 bg-gray-50 p-1 rounded-lg">
                      <button 
                        onClick={() => onUpdateQty(item.product.id, -1)}
                        className="p-1 hover:bg-white rounded transition-colors disabled:opacity-30"
                        disabled={item.quantity <= 1}
                      >
                        <MinusIcon className="w-4 h-4" />
                      </button>
                      <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => onUpdateQty(item.product.id, 1)}
                        className="p-1 hover:bg-white rounded transition-colors"
                      >
                        <PlusIcon className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-lg font-bold text-[#F44307]">
                      ₦{(item.product.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm sticky top-24">
            <h2 className="text-xl font-bold font-poppins mb-6">Cart Summary</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Items ({items.length})</span>
                <span>₦{total.toLocaleString()}</span>
              </div>
              <div className="border-t pt-4 flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-[#F44307]">₦{total.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-3">
              <button 
                onClick={onCheckout}
                className="w-full bg-[#F44307] text-white py-4 rounded-xl font-bold transition-all hover:bg-[#D83A06] shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                Proceed to Checkout
                <ArrowRightIcon className="w-5 h-5" />
              </button>
              
              <p className="text-center text-xs text-gray-400">
                Secure payments handled by OrtenticSEA Abuja
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartView;
