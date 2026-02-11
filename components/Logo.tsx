
import React from 'react';

const Logo: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizes = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-14'
  };

  return (
    <img 
      src="/ortenticsea-logo-nbg.png" 
      alt="Ortenticsea Logo" 
      className={`${sizes[size]} w-auto object-contain`}
    />
  );
};

export default Logo;
