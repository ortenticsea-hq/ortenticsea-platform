
import React from 'react';

export type UserRole = 'buyer' | 'seller' | 'admin';
export type SellerStatus = 'none' | 'pending' | 'approved' | 'rejected';
export type ProductStatus = 'pending' | 'approved' | 'rejected';
export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered';
export type ShopStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';

// --- Seller Success Suite Types ---
export interface ToolExpense {
  id: string;
  label: string;
  amount: number;
  type: 'repair' | 'transport' | 'misc' | 'purchase';
}

export interface InventoryItem {
  id: string;
  name: string;
  purchasePrice: number;
  expectedPrice: number;
  soldPrice?: number;
  expenses: ToolExpense[];
  location: string;
  dateAcquired: string; // ISO string
  dateSold?: string; // ISO string
  image?: string; // Base64 or URL
  status: 'available' | 'sold';
  category: string;
}

export interface CashflowSnapshot {
  totalCapital: number;
  expectedRevenue: number;
  netProfit: number;
  tiedUpCapital: number;
}
// --- End Seller Success Suite Types ---

export interface Product {
  id: string;
  name: string;
  price: number;
  condition: 'Like New' | 'Used';
  images: string[];
  sellerId: string;
  shopId?: string;
  category: string;
  description: string;
  status: ProductStatus;
  rejectionReason?: string;
  isTrending?: boolean;
  isNewArrival?: boolean;
  submittedAt?: string;
  availableQuantity?: number;
}

export interface Shop {
  id: string;
  ownerId: string;
  shopName: string;
  description: string;
  shopType: 'buyer' | 'seller';
  status: ShopStatus;
  rejectionReason?: string;
  createdAt?: string;
}

export interface ShopDocument {
  id: string;
  shopId: string;
  documentType: 'ID' | 'CAC' | 'ADDRESS';
  fileUrl: string;
  verified: boolean;
}

export interface Seller {
  id: string;
  name: string;
  isVerified: boolean;
  rating: number;
  reviewCount: number;
  joinDate?: string;
  description?: string;
  email?: string;
  location?: string;
}

export interface Report {
  id: string;
  targetId: string;
  targetType: 'product' | 'seller';
  reason: string;
  reporterName: string;
  status: 'open' | 'resolved' | 'dismissed';
  timestamp: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  targetId: string; // Product ID or Seller ID
  targetType: 'product' | 'seller';
  rating: number;
  comment: string;
  date: string;
}

export interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  locked?: boolean;
  isSpecial?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  emailVerified: boolean;
  sellerStatus?: SellerStatus;
  rejectionReason?: string;
  phone?: string;
  location?: string;
}

export interface SellerApplication {
  id: string;
  userId: string;
  shopName: string;
  description: string;
  phone: string;
  email: string;
  idDocument: string;
  sourcingProof: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  submittedAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  sellerId?: string;
}

export interface OrderPayment {
  provider: 'paystack';
  status: 'pending' | 'paid' | 'failed';
  reference?: string;
  checkoutUrl?: string;
  metadata?: Record<string, unknown>;
  paidAt?: string;
}

export interface Order {
  id: string;
  buyerId: string;
  buyerEmail?: string;
  items: OrderItem[];
  totalAmount: number;
  currency: 'NGN';
  status: OrderStatus;
  payment: OrderPayment;
  createdAt: string;
  updatedAt?: string;
}

export interface SharedCartComment {
  id: string;
  userName: string;
  text: string;
  timestamp: string;
}

export interface SharedCart {
  id: string;
  ownerId: string;
  items: CartItem[];
  locked: boolean;
  expiresAt: Date | null;
  createdAt: Date;
}

export interface SharedCartError {
  type: 'locked' | 'expired' | 'not-found';
  message: string;
}

export type ViewType = 
  | 'home' 
  | 'categories' 
  | 'product-detail' 
  | 'cart' 
  | 'chat' 
  | 'profile' 
  | 'sell' 
  | 'seller-profile'
  | 'admin-dashboard'
  | 'seller-onboarding'
  | 'seller-dashboard'
  | 'seller-tools'
  | 'shared-cart'
  | 'payment-success'
  | 'payment-cancel'
  | 'orders';
