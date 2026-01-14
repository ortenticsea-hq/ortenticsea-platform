
import React from 'react';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { StarIcon as StarIconOutline } from '@heroicons/react/24/outline';

interface StarRatingProps {
  rating: number;
  max?: number;
  onRatingChange?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({ 
  rating, 
  max = 5, 
  onRatingChange, 
  size = 'sm', 
  interactive = false 
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className="flex items-center gap-0.5">
      {[...Array(max)].map((_, i) => {
        const starIndex = i + 1;
        const isFilled = starIndex <= Math.round(rating);
        const Icon = isFilled ? StarIconSolid : StarIconOutline;
        
        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => onRatingChange?.(starIndex)}
            className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'} ${
              isFilled ? 'text-yellow-500' : 'text-gray-300'
            }`}
          >
            <Icon className={sizes[size]} />
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
