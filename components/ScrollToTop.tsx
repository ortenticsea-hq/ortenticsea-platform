
import React, { useState, useEffect } from 'react';
import { ChevronUpIcon } from '@heroicons/react/24/solid';

const ScrollToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = (scrolled / height) * 100;
      
      setProgress(scrollProgress);
      setIsVisible(scrolled > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed right-6 bottom-24 md:bottom-8 z-50 flex items-center justify-center w-12 h-12 rounded-full bg-[#0B1E3F] text-white shadow-lg transition-all duration-300 transform ${
        isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-50 pointer-events-none'
      } hover:bg-slate-800 active:scale-90`}
      aria-label="Scroll to top"
    >
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
        <circle
          cx="18"
          cy="18"
          r="16"
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="2"
        />
        <circle
          cx="18"
          cy="18"
          r="16"
          fill="none"
          stroke="#F26A21"
          strokeWidth="2"
          strokeDasharray="100"
          strokeDashoffset={100 - progress}
          strokeLinecap="round"
          className="transition-all duration-150"
        />
      </svg>
      <ChevronUpIcon className="w-5 h-5 relative z-10" />
    </button>
  );
};

export default ScrollToTop;
