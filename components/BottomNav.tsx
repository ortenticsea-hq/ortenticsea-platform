
import React from 'react';
import { 
  HomeIcon, 
  Squares2X2Icon, 
  PlusCircleIcon, 
  ChatBubbleLeftRightIcon, 
  UserCircleIcon 
} from '@heroicons/react/24/outline';
import { ViewType } from '../types';

interface BottomNavProps {
  activeView: ViewType;
  setView: (v: ViewType) => void;
  onProfileClick: () => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeView, setView, onProfileClick }) => {
  const items = [
    { id: 'home', label: 'Home', icon: HomeIcon },
    { id: 'categories', label: 'Browse', icon: Squares2X2Icon },
    { id: 'sell', label: 'Sell', icon: PlusCircleIcon },
    { id: 'chat', label: 'O-Assist', icon: ChatBubbleLeftRightIcon },
    { id: 'profile', label: 'Profile', icon: UserCircleIcon },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-40">
      <div className="flex justify-around items-center h-16">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              if (item.id === 'profile') {
                onProfileClick();
              } else {
                setView(item.id as ViewType);
              }
            }}
            className={`flex flex-col items-center gap-1 transition-colors ${
              activeView === item.id ? 'text-[#F26A21]' : 'text-gray-400 hover:text-[#0B1E3F]'
            }`}
          >
            <item.icon className="w-6 h-6" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BottomNav;
