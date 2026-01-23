
import React, { useState } from 'react';
import { CartItem, ViewType, SharedCartComment } from '../types';
import { 
  ShoppingBagIcon, 
  TrashIcon, 
  MinusIcon, 
  PlusIcon, 
  ArrowRightIcon, 
  ShareIcon, 
  CheckIcon,
  ChatBubbleBottomCenterTextIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import { User } from '../types';

interface CartViewProps {
  items: CartItem[];
  onRemove: (id: string) => void;
  onUpdateQty: (id: string, delta: number) => void;
  onCheckout: () => void;
  setView: (v: ViewType) => void;
  isShared?: boolean;
  sharedId?: string;
  comments?: SharedCartComment[];
  onAddComment?: (text: string) => void;
  currentUser?: User | null;
  onLoginRequired?: () => void;
}

const CartView: React.FC<CartViewProps> = ({ 
  items, 
  onRemove, 
  onUpdateQty, 
  onCheckout, 
  setView,
  isShared = false,
  sharedId,
  comments = [],
  onAddComment,
  currentUser,
  onLoginRequired
}) => {
  const [copied, setCopied] = useState(false);
  const [newComment, setNewComment] = useState('');
  const total = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const handleShare = () => {
    if (!currentUser) {
      onLoginRequired?.();
      return;
    }

    const data = items.map(item => ({ id: item.product.id, qty: item.quantity }));
    const encoded = btoa(JSON.stringify(data));
    const uniqueId = sharedId || Math.random().toString(36).substr(2, 9);
    const shareUrl = `${window.location.origin}${window.location.pathname}?view=shared-cart&id=${uniqueId}&data=${encoded}`;
    
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim() && onAddComment) {
      onAddComment(newComment);
      setNewComment('');
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-6">
          <ShoppingBagIcon className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-bold font-poppins mb-2">{isShared ? 'Shared cart is empty' : 'Your cart is empty'}</h2>
        <p className="text-gray-500 mb-8 max-w-xs">Looks like you haven't added any quality items to your cart yet.</p>
        <button 
          onClick={() => setView('home')}
          className="bg-[#F26A21] text-white px-8 py-3 rounded-xl font-bold transition-all hover:bg-orange-600"
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
          <h1 className="text-3xl font-bold font-poppins">{isShared ? 'Shared Shopping Cart' : 'Shopping Cart'}</h1>
          {isShared && <p className="text-gray-500 text-sm mt-1">A friend shared these Abuja finds with you!</p>}
        </div>
        
        {!isShared && (
          <button 
            onClick={handleShare}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-sm ${
              copied ? 'bg-green-500 text-white' : 'bg-white border border-[#F26A21] text-[#F26A21] hover:bg-orange-50'
            }`}
          >
            {copied ? <CheckIcon className="w-5 h-5" /> : <ShareIcon className="w-5 h-5" />}
            {copied ? 'Link Copied!' : 'Share Cart for Feedback'}
          </button>
        )}
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
                    {!isShared && (
                      <button onClick={() => onRemove(item.product.id)} className="text-gray-400 hover:text-red-500">
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mb-3">{item.product.condition}</p>
                  <div className="flex justify-between items-end">
                    <div className={`flex items-center gap-3 bg-gray-50 p-1 rounded-lg ${isShared ? 'px-3 py-1.5' : ''}`}>
                      {!isShared && (
                        <button 
                          onClick={() => onUpdateQty(item.product.id, -1)}
                          className="p-1 hover:bg-white rounded transition-colors disabled:opacity-30"
                          disabled={item.quantity <= 1}
                        >
                          <MinusIcon className="w-4 h-4" />
                        </button>
                      )}
                      <span className="text-sm font-bold w-4 text-center">{isShared ? `Qty: ${item.quantity}` : item.quantity}</span>
                      {!isShared && (
                        <button 
                          onClick={() => onUpdateQty(item.product.id, 1)}
                          className="p-1 hover:bg-white rounded transition-colors"
                        >
                          <PlusIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <span className="font-bold text-[#F26A21]">₦{(item.product.price * item.quantity).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Collaborative Comment Section */}
          <div className="mt-12 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-orange-50/30 flex items-center gap-2">
              <ChatBubbleBottomCenterTextIcon className="w-5 h-5 text-[#F26A21]" />
              <h3 className="font-bold text-[#0B1E3F]">Collaborative Feedback</h3>
            </div>
            
            <div className="p-6 space-y-6">
              {comments.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400 text-sm">No comments yet. Be the first to drop a suggestion!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#0B1E3F] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {comment.userName.charAt(0)}
                      </div>
                      <div className="bg-gray-50 p-3 rounded-2xl rounded-tl-none flex-grow">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] font-bold text-[#0B1E3F] uppercase tracking-wider">{comment.userName}</span>
                          <span className="text-[9px] text-gray-400">{new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-sm text-gray-700">{comment.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {isShared && (
                <form onSubmit={handleCommentSubmit} className="relative mt-4">
                  <input 
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Wetin you think about these items? Drop a comment..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-[#F26A21] transition-all text-sm"
                  />
                  <button 
                    type="submit"
                    disabled={!newComment.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[#F26A21] hover:bg-orange-100 rounded-full transition-all disabled:opacity-30"
                  >
                    <PaperAirplaneIcon className="w-5 h-5" />
                  </button>
                </form>
              )}
              
              {!isShared && (
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
                  <ShareIcon className="w-5 h-5 text-blue-500 mt-0.5" />
                  <p className="text-xs text-blue-700 leading-relaxed">
                    Share this cart with your friends in Abuja! They can see your selection and drop comments to help you decide on the best items.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-md sticky top-24">
            <h3 className="text-xl font-bold mb-6">Order Summary</h3>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span>₦{total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Shipping (Abuja)</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>
              <div className="pt-4 border-t border-gray-100 flex justify-between font-bold text-xl">
                <span>Total</span>
                <span className="text-[#F26A21]">₦{total.toLocaleString()}</span>
              </div>
            </div>
            
            {!isShared ? (
              <button 
                onClick={() => {
                  if (!currentUser) {
                    onLoginRequired?.();
                  } else {
                    onCheckout();
                  }
                }}
                className="w-full bg-[#0B1E3F] text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
              >
                Checkout Now
                <ArrowRightIcon className="w-5 h-5" />
              </button>
            ) : (
              <button 
                onClick={() => setView('home')}
                className="w-full bg-[#F26A21] text-white py-4 rounded-2xl font-bold hover:bg-orange-600 transition-all flex items-center justify-center gap-2"
              >
                Shop Similar Items
                <ShoppingBagIcon className="w-5 h-5" />
              </button>
            )}
            
            <p className="text-center text-xs text-gray-400 mt-4">
              {isShared ? 'View only shared cart mode' : 'Secure payments handled by OrtenticSEA Abuja'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartView;
