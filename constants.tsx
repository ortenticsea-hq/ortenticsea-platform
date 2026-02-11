
import React from 'react';
import { 
  DevicePhoneMobileIcon, 
  ComputerDesktopIcon, 
  HomeIcon, 
  SparklesIcon, 
  TagIcon, 
  ShoppingBagIcon, 
  FaceSmileIcon, 
  TruckIcon, 
  BoltIcon, 
  BriefcaseIcon, 
  SquaresPlusIcon, 
  ScissorsIcon, 
  RectangleStackIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { Product, Seller, Category, Review, Report } from './types';

// Custom SVG Icons
const ShoeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <path d="M3 21h18v-2a4 4 0 0 0-4-4h-2.5l-1.5-3.5L10 8l-2 1v4H3v8z" />
    <path d="M10 8c0-2.21-1.79-4-4-4S2 5.79 2 8v5h6V8z" opacity="0.3" />
    <path d="M13 15.5l2 4" />
  </svg>
);

const HatIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <path d="M2 18h20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z" />
    <path d="M4 18V9a8 8 0 1 1 16 0v9" />
    <path d="M12 2v2" />
  </svg>
);

const ShirtIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 1.88v6.52a2 2 0 00.59 1.41l4.46 4.46a2 2 0 01.59 1.41V20a2 2 0 002 2h4a2 2 0 002-2v-2.86a2 2 0 01.59-1.41l4.46-4.46a2 2 0 00.59-1.41V5.34a2 2 0 00-1.34-1.88z" />
  </svg>
);

const PantIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <path d="M6 3h12l1 18h-5l-2-7-2 7H5l1-18z" />
    <path d="M12 3v11" />
    <path d="M9 3v2" />
    <path d="M15 3v2" />
  </svg>
);

const SocksIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <path d="M5 3h4v6c0 2-1 4-2 4s-2-2-2-4V3z" />
    <path d="M15 3h4v6c0 2-1 4-2 4s-2-2-2-4V3z" />
    <path d="M5 13h4v8H5z" />
    <path d="M15 13h4v8h-4z" />
  </svg>
);

const JerseyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <path d="M4 7h16l-1 12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 7z" />
    <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M9 11h6" />
    <path d="M10 16h4" />
  </svg>
);

export const SELLERS: Seller[] = [
  { 
    id: 's1', 
    name: 'Abuja Gadget Hub', 
    isVerified: true, 
    rating: 4.8, 
    reviewCount: 124,
    joinDate: 'Jan 2022',
    description: 'Premier destination for UK-used iPhones and high-end smartphones in the heart of Abuja.'
  },
  { 
    id: 's2', 
    name: 'Musa Electronics', 
    isVerified: true, 
    rating: 4.5, 
    reviewCount: 89,
    joinDate: 'Mar 2021',
    description: 'Reliable household electronics and home entertainment systems at competitive prices.'
  },
  { 
    id: 's3', 
    name: 'Grace Home Store', 
    isVerified: false, 
    rating: 4.2, 
    reviewCount: 45,
    joinDate: 'Jun 2023',
    description: 'Used appliances that work like new. We test every item before it hits the store.'
  },
  { 
    id: 's4', 
    name: 'TechBros Wuse 2', 
    isVerified: true, 
    rating: 4.9, 
    reviewCount: 210,
    joinDate: 'Oct 2020',
    description: 'The laptop specialists. If you need a workstation or a gaming rig, we gat you.'
  },
];

export const CATEGORIES: Category[] = [
  { id: 'osw', name: 'OSW Special', icon: <GlobeAltIcon />, locked: true, isSpecial: true },
  { id: 'c1', name: 'Phones', icon: <DevicePhoneMobileIcon className="w-6 h-6" /> },
  { id: 'c2', name: 'Laptops', icon: <ComputerDesktopIcon className="w-6 h-6" /> },
  { id: 'c15', name: 'Denim Jeans', icon: <PantIcon /> },
  { id: 'c16', name: 'Lumber Jacket', icon: <ShirtIcon /> },
  { id: 'c19', name: 'Hoodie', icon: <ShirtIcon /> },
  { id: 'c17', name: 'Socks', icon: <SocksIcon /> },
  { id: 'c18', name: 'Jersey', icon: <JerseyIcon /> },
  { id: 'c4', name: 'Home', icon: <HomeIcon className="w-6 h-6" /> },
  { id: 'c5', name: 'Appliances', icon: <BoltIcon className="w-6 h-6" /> },
  { id: 'c6', name: 'Clothing', icon: <ShoppingBagIcon className="w-6 h-6" /> },
  { id: 'c12', name: 'Back Packs', icon: <BriefcaseIcon className="w-6 h-6" /> },
  { id: 'c13', name: 'Shoes', icon: <ShoeIcon /> },
  { id: 'c14', name: 'Baseball Hats', icon: <HatIcon /> },
  { id: 'c7', name: 'Toys', icon: <FaceSmileIcon className="w-6 h-6" /> },
  { id: 'c8', name: 'Vehicles', icon: <TruckIcon className="w-6 h-6" /> },
  { id: 'c11', name: 'Other', icon: <SquaresPlusIcon className="w-6 h-6" /> },
];

export const REPORTS: Report[] = [
  {
    id: 'rep1',
    targetId: 'p1',
    targetType: 'product',
    reason: 'Suspiciously low price for condition',
    reporterName: 'John Obi',
    status: 'open',
    timestamp: '2023-11-15T10:00:00Z'
  },
  {
    id: 'rep2',
    targetId: 's3',
    targetType: 'seller',
    reason: 'Unresponsive after payment inquiry',
    reporterName: 'Amina S.',
    status: 'open',
    timestamp: '2023-11-14T15:30:00Z'
  }
];

export const PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'iPhone 13 Pro Max - 256GB',
    price: 450000,
    condition: 'Like New',
    images: ['https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&q=80&w=600', 'https://images.unsplash.com/photo-1616348436168-de43ad0db179?auto=format&fit=crop&q=80&w=600'],
    sellerId: 's1',
    category: 'Phones',
    description: 'UK used iPhone 13 Pro Max. Graphite color, 256GB storage. 100% Battery health. No scratches.',
    isTrending: true,
    status: 'approved'
  },
  {
    id: 'p2',
    name: 'MacBook Pro M1 2020',
    price: 680000,
    condition: 'Used',
    images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=600'],
    sellerId: 's4',
    category: 'Laptops',
    description: '13-inch MacBook Pro with M1 chip. 8GB RAM, 256GB SSD. Perfect for students and professionals.',
    isTrending: true,
    status: 'approved'
  },
  {
    id: 'p14',
    name: "Levi's 501 Original Fit Denim",
    price: 18500,
    condition: 'Like New',
    images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=600'],
    sellerId: 's3',
    category: 'Denim Jeans',
    description: 'Classic Levi\'s 501s. Heavyweight denim, straight leg. Grade-A UK used quality.',
    isNewArrival: true,
    isTrending: true,
    status: 'approved'
  },
  {
    id: 'p100',
    name: 'Pending Gaming Laptop',
    price: 950000,
    condition: 'Like New',
    images: ['https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&q=80&w=600'],
    sellerId: 's4',
    category: 'Laptops',
    description: 'RTX 3080 Gaming beast. Only used for 2 weeks.',
    status: 'pending',
    submittedAt: '2023-11-20T09:00:00Z'
  },
  {
    id: 'p101',
    name: 'Unverified Rolex Submariner',
    price: 5500000,
    condition: 'Like New',
    images: ['https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&q=80&w=600'],
    sellerId: 's1',
    category: 'Other',
    description: 'Luxury watch, pre-owned but mint.',
    status: 'pending',
    submittedAt: '2023-11-21T11:00:00Z'
  }
];

export const REVIEWS: Review[] = [
  {
    id: 'r1',
    userId: 'u10',
    userName: 'Chidi K.',
    targetId: 'p1',
    targetType: 'product',
    rating: 5,
    comment: 'The iPhone 13 Pro Max is exactly as described. Battery life is amazing!',
    date: '2023-10-12'
  },
  {
    id: 'r2',
    userId: 'u11',
    userName: 'Aisha O.',
    targetId: 'p1',
    targetType: 'product',
    rating: 4,
    comment: 'Great phone, but shipping took an extra day. Overall satisfied.',
    date: '2023-11-05'
  },
  {
    id: 'r3',
    userId: 'u12',
    userName: 'Emeka J.',
    targetId: 's4',
    targetType: 'seller',
    rating: 5,
    comment: 'Best place in Abuja for laptops. They really know their tech!',
    date: '2023-09-20'
  }
];
