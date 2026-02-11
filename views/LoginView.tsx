
import React, { useState } from 'react';
import { XMarkIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import Logo from '../components/Logo';
import { FirebaseAuthService } from '../services/firebaseAuthService';

interface LoginViewProps {
  onClose: () => void;
  onSuccess: (user: any) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onClose, onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isReset, setIsReset] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      let user;
      if (isReset) {
        await FirebaseAuthService.sendPasswordResetEmail(email);
        setResetEmail(email);
        setResetSent(true);
        setIsLoading(false);
        return;
      }
      if (isLogin) {
        user = await FirebaseAuthService.signInWithEmail(email, password);
      } else {
        user = await FirebaseAuthService.registerWithEmail(email, password, name);
      }
      onSuccess(user);
    } catch (err: any) {
      const fallback = isReset ? 'Failed to send reset link' : 'Authentication failed';
      setError(err.message || fallback);
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
              {isReset ? 'Reset Password' : isLogin ? 'Welcome Back!' : 'Create Account'}
            </h2>
            <p className="text-gray-500 text-xs mt-1.5">
              {isReset ? 'We will email you a reset link' : isLogin ? 'Sign in to continue' : 'Join OrtenticSEA'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {!isLogin && !isReset && (
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

            {!isReset && (
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
            )}

            {isReset && resetSent && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg text-xs">
                Reset link sent to <span className="font-semibold">{resetEmail}</span>. Check your inbox (and spam).
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-xs">
                {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoading || (isReset && resetSent)}
              className="w-full bg-[#F26A21] text-white py-3 rounded-lg font-bold text-sm hover:bg-orange-600 shadow-lg shadow-orange-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Loading...' : isReset ? (resetSent ? 'Link Sent' : 'Send Reset Link') : isLogin ? 'Sign In' : 'Create Account'}
            </button>

            {!isReset && (
              <button 
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full bg-white border-2 border-gray-200 text-[#0B1E3F] py-2.5 rounded-lg font-bold text-sm hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  'Loading...'
                ) : (
                  <>
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                      <path fill="none" d="M0 0h48v48H0z"></path>
                    </svg>
                    Sign in with Google
                  </>
                )}
              </button>
            )}
          </form>

          <div className="mt-5 pt-4 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-500">
              {isReset ? 'Remembered your password?' : isLogin ? "Don't have account?" : "Have account?"}
              <button 
                onClick={() => {
                  setIsReset(false);
                  setResetSent(false);
                  setIsLogin(!isLogin);
                }}
                disabled={isLoading}
                className="ml-1.5 font-bold text-[#F26A21] hover:underline disabled:opacity-50"
              >
                {isReset ? 'Sign In' : isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
            {!isReset && (
              <button
                onClick={() => {
                  setIsReset(true);
                  setResetSent(false);
                  setResetEmail('');
                  setError('');
                }}
                disabled={isLoading}
                className="mt-2 text-[11px] text-gray-400 hover:text-[#F26A21] underline disabled:opacity-50"
              >
                Forgot password?
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
