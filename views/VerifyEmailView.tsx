import React, { useState } from 'react';
import { EnvelopeIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { FirebaseAuthService } from '../services/firebaseAuthService';
import { User } from '../types';

interface VerifyEmailViewProps {
  user: User;
  onLogout: () => void;
}

const VerifyEmailView: React.FC<VerifyEmailViewProps> = ({ user, onLogout }) => {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    setLoading(true);
    setError('');
    try {
      await FirebaseAuthService.sendVerificationEmail();
      setSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send email');
    } finally {
      setLoading(false);
    }
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#0B1E3F]/90 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center animate-in fade-in zoom-in duration-300">
        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6 text-[#F26A21]">
          <EnvelopeIcon className="w-10 h-10" />
        </div>
        
        <h2 className="text-2xl font-bold text-[#0B1E3F] mb-2 font-poppins">Verify your Email</h2>
        <p className="text-gray-500 mb-6 text-sm leading-relaxed">
          We sent a verification link to <br/><strong className="text-[#0B1E3F]">{user.email}</strong>.<br/>
          Please check your inbox and click the link to continue.
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs mb-4 border border-red-100">
            {error}
          </div>
        )}

        {sent && (
          <div className="bg-green-50 text-green-600 p-3 rounded-xl text-xs mb-4 border border-green-100">
            Verification email sent! Check your inbox.
          </div>
        )}

        <div className="space-y-3">
          <button onClick={handleSend} disabled={loading || sent} className="w-full bg-[#F26A21] text-white py-3.5 rounded-xl font-bold hover:bg-orange-600 transition-all disabled:opacity-50 shadow-lg shadow-orange-500/20">
            {loading ? 'Sending...' : sent ? 'Email Sent' : 'Resend Verification Email'}
          </button>

          <button onClick={handleReload} className="w-full bg-white border-2 border-gray-100 text-[#0B1E3F] py-3.5 rounded-xl font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
            <ArrowPathIcon className="w-5 h-5" />
            I've Verified, Refresh App
          </button>

          <button onClick={onLogout} className="text-gray-400 text-xs hover:text-white transition-colors mt-4 underline">
            Sign Out / Use Different Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailView;