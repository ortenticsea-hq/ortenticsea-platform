import React, { useState, useEffect } from 'react';
import { initPaystackTransaction } from '../services/paystackService';
import { FirestoreService } from '../services/firestoreService';
import { CartItem, Order, User } from '../types';
import { ArrowLeftIcon, CheckIcon, XMarkIcon, ExclamationIcon } from '@heroicons/react/24/outline';

interface CheckoutViewProps {
  items: CartItem[];
  currentUser: User | null;
  onBack: () => void;
  onPaymentSuccess: (orderId: string) => void;
  onPaymentFailed: () => void;
}

const CheckoutView: React.FC<CheckoutViewProps> = ({
  items,
  currentUser,
  onBack,
  onPaymentSuccess,
  onPaymentFailed,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paymentStep, setPaymentStep] = useState<
    'review' | 'processing' | 'success' | 'failed'
  >('review');

  const totalAmount = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  // Load Paystack script on mount
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      try {
        document.body.removeChild(script);
      } catch (e) {
        // Script was already removed
      }
    };
  }, []);

  const handleInitiatePayment = async () => {
    if (!currentUser) {
      setError('You must be logged in to proceed with payment.');
      return;
    }

    if (items.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Generate order ID
      const newOrderId =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `${currentUser.id}_${Date.now()}`;

      setOrderId(newOrderId);

      // Step 1: Initialize payment via Cloud Function
      const paymentResponse = await initPaystackTransaction({
        orderId: newOrderId,
        email: currentUser.email,
        amount: totalAmount,
        callbackUrl: `${window.location.origin}?view=payment-success`,
      });

      setPaymentStep('processing');

      // Step 2: Open Paystack popup
      const pubKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '';
      if (!pubKey) {
        throw new Error('Paystack public key not configured');
      }

      if (!(window as any).PaystackPop) {
        throw new Error('Paystack SDK not loaded');
      }

      const paystackPopup = (window as any).PaystackPop.setup({
        key: pubKey,
        email: currentUser.email,
        amount: Math.round(totalAmount * 100), // Convert to kobo
        currency: 'NGN',
        ref: paymentResponse.reference,
        onClose: () => {
          console.log('Payment window closed');
          setPaymentStep('review');
          setLoading(false);
        },
        onSuccess: async (response: any) => {
          console.log('Payment successful:', response);
          setPaymentStep('success');
          // Call success handler after delay
          setTimeout(() => {
            onPaymentSuccess(newOrderId);
          }, 2000);
        },
      });

      paystackPopup.openIframe();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An error occurred during payment initialization';
      console.error('Payment initialization error:', err);
      setError(errorMessage);
      setPaymentStep('review');
    } finally {
      setLoading(false);
    }
  };

  if (paymentStep === 'success') {
    return (
      <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6">
          <CheckIcon className="w-12 h-12" />
        </div>
        <h1 className="text-3xl font-bold font-poppins mb-2">Payment Successful! 🎉</h1>
        <p className="text-gray-600 mb-4">Reference: {orderId}</p>
        <p className="text-gray-500 mb-8 max-w-xs">
          Your order has been confirmed. You will receive delivery updates via email.
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => onPaymentSuccess(orderId || '')}
            className="bg-[#F44307] text-white px-8 py-3 rounded-xl font-bold transition-all hover:bg-[#D83A06]"
          >
            View Order Details
          </button>
        </div>
      </div>
    );
  }

  if (paymentStep === 'failed') {
    return (
      <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-6">
          <XMarkIcon className="w-12 h-12" />
        </div>
        <h1 className="text-3xl font-bold font-poppins mb-2">Payment Failed</h1>
        <p className="text-gray-500 mb-8 max-w-xs">
          {error || 'Unfortunately, your payment could not be processed. Please try again.'}
        </p>
        <button
          onClick={() => {
            setPaymentStep('review');
            setError(null);
            onPaymentFailed();
          }}
          className="bg-[#F44307] text-white px-8 py-3 rounded-xl font-bold transition-all hover:bg-[#D83A06]"
        >
          Retry Payment
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center gap-4 mb-10">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <h1 className="text-3xl font-bold font-poppins">Checkout</h1>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl flex gap-3">
          <ExclamationIcon className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-red-900">Error</h3>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Order Summary */}
        <div className="lg:col-span-2">
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="text-2xl font-bold mb-8">Order Summary</h2>

            {/* Order Items */}
            <div className="space-y-4 mb-8">
              {items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex justify-between items-center pb-4 border-b border-gray-100"
                >
                  <div className="flex-1">
                    <p className="font-semibold mb-1">{item.product.name}</p>
                    <p className="text-sm text-gray-500">
                      {item.product.condition} • Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="font-bold text-[#F44307]">
                    ₦{(item.product.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            {/* Delivery Info (if logged in) */}
            {currentUser && (
              <div className="bg-gray-50 p-6 rounded-xl mb-8">
                <h3 className="font-bold mb-4">Delivery Information</h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-gray-500">Name:</span>{' '}
                    <span className="font-medium">{currentUser.name}</span>
                  </p>
                  <p>
                    <span className="text-gray-500">Email:</span>{' '}
                    <span className="font-medium">{currentUser.email}</span>
                  </p>
                  {currentUser.phone && (
                    <p>
                      <span className="text-gray-500">Phone:</span>{' '}
                      <span className="font-medium">{currentUser.phone}</span>
                    </p>
                  )}
                  {currentUser.location && (
                    <p>
                      <span className="text-gray-500">Location:</span>{' '}
                      <span className="font-medium">{currentUser.location}</span>
                    </p>
                  )}
                </div>
                <button className="text-[#F44307] font-bold text-sm mt-4 hover:underline">
                  Edit Delivery Info
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Payment Section */}
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm sticky top-24">
            <h2 className="text-xl font-bold mb-6">Payment</h2>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>₦{totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery</span>
                <span>₦0 (Free local delivery)</span>
              </div>
              <div className="border-t pt-4 flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-[#F44307]">₦{totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={handleInitiatePayment}
              disabled={loading || !currentUser}
              className={`w-full py-4 rounded-xl font-bold transition-all text-white ${
                loading || !currentUser
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-[#F44307] hover:bg-[#D83A06]'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </div>
              ) : (
                'Pay with Paystack'
              )}
            </button>

            {!currentUser && (
              <p className="text-center text-xs text-red-600 mt-4">
                Please log in to proceed with payment
              </p>
            )}

            <div className="mt-6 space-y-3">
              <div className="flex items-start gap-2 text-xs text-gray-500">
                <div className="w-1 h-1 bg-gray-400 rounded-full mt-1.5 flex-shrink-0"></div>
                <span>Secure payments powered by Paystack</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-gray-500">
                <div className="w-1 h-1 bg-gray-400 rounded-full mt-1.5 flex-shrink-0"></div>
                <span>Your card details are never shared</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-gray-500">
                <div className="w-1 h-1 bg-gray-400 rounded-full mt-1.5 flex-shrink-0"></div>
                <span>Orders are final after confirmation</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutView;
