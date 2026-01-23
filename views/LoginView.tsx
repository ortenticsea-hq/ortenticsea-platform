
import React, { useState } from 'react';
import { XMarkIcon, EyeIcon, EyeSlashIcon, SparklesIcon } from '@heroicons/react/24/outline';
import Logo from '../components/Logo';
import { FirebaseAuthService } from '../services/firebaseAuthService';

interface LoginViewProps {
  onClose: () => void;
  onSuccess: (user: any) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onClose, onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      let user;
      if (isLogin) {
        user = await FirebaseAuthService.signInWithEmail(email, password);
      } else {
        user = await FirebaseAuthService.registerWithEmail(email, password, name);
      }
      onSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setIsLoading(true);

    try {
      const user = await FirebaseAuthService.signInWithGoogle();
      onSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed');
      setIsLoading(false);
    }
  };

  const quickLogin = (type: 'admin' | 'seller') => {
    if (type === 'admin') {
      onSuccess({ id: 'admin_id', name: 'Francis (Admin)', email: 'francisetham01@gmail.com' });
    } else {
      onSuccess({ id: 'u123', name: 'Wuse Merchant', email: 'wuse@market.com' });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2">
      <div 
        className="absolute inset-0 bg-[#0B1E3F]/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      <div className="relative bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-[#0B1E3F] transition-colors"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        <div className="p-6 md:p-7">
          <div className="flex flex-col items-center text-center mb-5">
            <Logo size="sm" />
            <h2 className="text-xl font-bold font-poppins mt-3 text-[#0B1E3F]">
              {isLogin ? 'Welcome Back!' : 'Create Account'}
            </h2>
            <p className="text-gray-500 text-xs mt-1.5">
              {isLogin ? 'Sign in to continue' : 'Join OrtenticSEA'}
            </p>
          </div>

          {/* Quick Demo Access Section */}
          <div className="bg-orange-50 p-3 rounded-xl mb-4 border border-orange-100">
            <p className="text-[9px] font-black text-[#F26A21] uppercase tracking-widest mb-2.5 flex items-center gap-1">
              <SparklesIcon className="w-3 h-3" /> Demo Mode
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => quickLogin('seller')}
                className="bg-white border border-orange-200 text-[#0B1E3F] px-2.5 py-2 rounded-lg text-[10px] font-bold hover:bg-[#F26A21] hover:text-white hover:border-[#F26A21] transition-all shadow-sm"
              >
                Seller
              </button>
              <button 
                onClick={() => quickLogin('admin')}
                className="bg-[#0B1E3F] text-white px-2.5 py-2 rounded-lg text-[10px] font-bold hover:bg-slate-800 transition-all shadow-sm"
              >
                Admin
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#0B1E3F] uppercase tracking-wider">Full Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                  disabled={isLoading}
                  className="w-full bg-white px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#F26A21] transition-all disabled:opacity-50 text-sm"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#0B1E3F] uppercase tracking-wider">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                disabled={isLoading}
                className="w-full bg-white px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#F26A21] transition-all disabled:opacity-50 text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#0B1E3F] uppercase tracking-wider">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                  className="w-full bg-white px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#F26A21] transition-all disabled:opacity-50 text-sm"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0B1E3F]"
                >
                  {showPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-xs">
                {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#F26A21] text-white py-3 rounded-lg font-bold text-sm hover:bg-orange-600 shadow-lg shadow-orange-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Loading...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>

            <button 
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full bg-white border-2 border-gray-200 text-[#0B1E3F] py-2.5 rounded-lg font-bold text-sm hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Loading...' : '🔍 Google'}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-500">
              {isLogin ? "Don't have account?" : "Have account?"}
              <button 
                onClick={() => setIsLogin(!isLogin)}
                disabled={isLoading}
                className="ml-1.5 font-bold text-[#F26A21] hover:underline disabled:opacity-50"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
