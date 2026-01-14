
import React from 'react';
import { SquaresPlusIcon } from '@heroicons/react/24/outline';

interface PlaceholderViewProps {
  title: string;
  description: string;
}

const PlaceholderView: React.FC<PlaceholderViewProps> = ({ title, description }) => {
  return (
    <div className="container mx-auto px-4 py-24 text-center min-h-screen">
      <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6 text-[#F26A21]">
        <SquaresPlusIcon className="w-10 h-10" />
      </div>
      <h1 className="text-3xl font-bold font-poppins mb-4">{title}</h1>
      <p className="text-gray-500 max-w-md mx-auto mb-8">
        {description}
      </p>
      <div className="p-8 bg-white border-2 border-dashed border-gray-200 rounded-3xl text-gray-400 font-medium">
        Module Under Development - Coming Soon to Abuja!
      </div>
    </div>
  );
};

export default PlaceholderView;
