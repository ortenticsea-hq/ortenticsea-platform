import React from 'react';
import { CheckCircleIcon, XCircleIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { ViewType } from '../types';

interface PaymentReturnViewProps {
  status: 'success' | 'cancel';
  setView: (v: ViewType | string) => void;
}

const PaymentReturnView: React.FC<PaymentReturnViewProps> = ({ status, setView }) => {
  const isSuccess = status === 'success';

  return (
    <div className="container mx-auto px-4 py-16 md:py-24">
      <div className="max-w-2xl mx-auto bg-white border border-gray-100 rounded-3xl shadow-sm p-8 md:p-12 text-center">
        <div
          className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${
            isSuccess ? 'bg-green-50' : 'bg-red-50'
          }`}
        >
          {isSuccess ? (
            <CheckCircleIcon className="w-12 h-12 text-green-600" />
          ) : (
            <XCircleIcon className="w-12 h-12 text-red-600" />
          )}
        </div>

        <h1 className="mt-6 text-3xl font-bold font-poppins text-[#0B1E3F]">
          {isSuccess ? 'Payment Successful' : 'Payment Cancelled'}
        </h1>

        <p className="mt-3 text-gray-600">
          {isSuccess
            ? 'Your payment was received. You can continue shopping or return to your cart.'
            : 'No charge was completed. You can return to cart and try checkout again.'}
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => setView('home')}
            className="px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
          >
            Continue Shopping
          </button>
          {isSuccess && (
            <button
              onClick={() => setView('orders')}
              className="px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
            >
              View Orders
            </button>
          )}
          <button
            onClick={() => setView('cart')}
            className="px-6 py-3 rounded-xl bg-[#F44307] text-white font-bold hover:bg-[#D83A06] transition-colors inline-flex items-center justify-center gap-2"
          >
            Back to Cart
            <ArrowRightIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentReturnView;
