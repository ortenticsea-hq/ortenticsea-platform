
import React, { useState } from 'react';
import { 
  BuildingStorefrontIcon, 
  CheckBadgeIcon, 
  ClockIcon, 
  PlusCircleIcon,
  ShoppingBagIcon,
  ArrowTrendingUpIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  WrenchScrewdriverIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { User, Product, SellerStatus, ShopStatus } from '../types';
import { CATEGORIES } from '../constants';
import { storage } from '../services/firebaseStorage';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface SellerDashboardViewProps {
  user: User;
  products: Product[];
  applicationStatus?: SellerStatus;
  applicationRejectionReason?: string;
  shopStatus?: ShopStatus;
  shopRejectionReason?: string;
  onCreateProduct: (data: {
    name: string;
    price: number;
    condition: 'Like New' | 'Used';
    category: string;
    description: string;
    images: string[];
  }) => Promise<void>;
  onRefreshStatus: () => void;
  onOpenTools: () => void;
  onReapply: () => void;
}

const SellerDashboardView: React.FC<SellerDashboardViewProps> = ({
  user,
  products,
  applicationStatus,
  applicationRejectionReason,
  shopStatus,
  shopRejectionReason,
  onCreateProduct,
  onRefreshStatus,
  onOpenTools,
  onReapply,
}) => {
  const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  const MAX_IMAGES = 6;
  const sellerProducts = products.filter(p => p.sellerId === user.id);
  const effectiveStatus = shopStatus || applicationStatus || user.sellerStatus || 'none';
  const canListItems = effectiveStatus === 'APPROVED' || effectiveStatus === 'approved';
  const canUseTools = canListItems;
  const categoryOptions = CATEGORIES.filter((c) => !c.locked && !c.isSpecial).map((c) => c.name);
  const defaultCategory = categoryOptions[0] || '';
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    condition: 'Used' as 'Like New' | 'Used',
    category: defaultCategory,
    description: '',
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const resetForm = () => {
    imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    setNewProduct({
      name: '',
      price: '',
      condition: 'Used',
      category: defaultCategory,
      description: '',
    });
    setImageFiles([]);
    setImagePreviews([]);
    setFormError(null);
  };

  const handleOpenCreate = () => {
    if (!canListItems) return;
    resetForm();
    setShowCreateModal(true);
  };

  const statusLabel = (() => {
    if (effectiveStatus === 'APPROVED' || effectiveStatus === 'approved') return 'Approved';
    if (effectiveStatus === 'SUBMITTED' || effectiveStatus === 'pending') return 'Submitted';
    if (effectiveStatus === 'UNDER_REVIEW') return 'Under Review';
    if (effectiveStatus === 'REJECTED' || effectiveStatus === 'rejected') return 'Rejected';
    return 'Draft';
  })();

  const statusClasses = (() => {
    if (statusLabel === 'Approved') return 'bg-green-50 text-green-600 border-green-100';
    if (statusLabel === 'Submitted' || statusLabel === 'Under Review') return 'bg-blue-50 text-blue-600 border-blue-100';
    if (statusLabel === 'Rejected') return 'bg-red-50 text-red-600 border-red-100';
    return 'bg-gray-50 text-gray-500 border-gray-100';
  })();

  const handleCloseCreate = () => {
    setShowCreateModal(false);
    resetForm();
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canListItems) return;
    setFormError(null);
    const price = Number(newProduct.price);
    if (!newProduct.name.trim() || !newProduct.category.trim() || !newProduct.description.trim()) {
      setFormError('Please fill in all required fields.');
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      setFormError('Price must be a positive number.');
      return;
    }
    if (imageFiles.length === 0) {
      setFormError('Please upload at least one image.');
      return;
    }

    setIsSubmitting(true);
    try {
      const urls = await uploadProductImages(imageFiles);
      await onCreateProduct({
        name: newProduct.name.trim(),
        price,
        condition: newProduct.condition,
        category: newProduct.category.trim(),
        description: newProduct.description.trim(),
        images: urls,
      });
      setShowCreateModal(false);
      resetForm();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Unable to create listing right now. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateImages = (files: File[]) => {
    if (files.length > MAX_IMAGES) {
      throw new Error(`You can upload up to ${MAX_IMAGES} images.`);
    }
    for (const file of files) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        throw new Error(`Unsupported file type: ${file.type}`);
      }
      if (file.size > MAX_IMAGE_SIZE) {
        const mb = (file.size / 1024 / 1024).toFixed(1);
        throw new Error(`Image too large (${mb}MB). Max is 5MB.`);
      }
    }
  };

  const uploadProductImages = async (files: File[]) => {
    validateImages(files);
    const urls: string[] = [];
    for (let i = 0; i < files.length; i += 1) {
      const file = files[i];
      const ext = file.name.split('.').pop() || 'jpg';
      const fileName = `${user.id}_${Date.now()}_${Math.random().toString(36).slice(2)}_${i}.${ext}`;
      const storageRef = ref(storage, `products/${user.id}/${fileName}`);
      const snapshot = await uploadBytes(storageRef, file, { contentType: file.type });
      const url = await getDownloadURL(snapshot.ref);
      urls.push(url);
    }
    return urls;
  };

  const handleImageFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setFormError(null);
    const incoming = Array.from(files);
    const merged = [...imageFiles, ...incoming];
    try {
      validateImages(merged);
      const previews = incoming.map((file) => URL.createObjectURL(file));
      setImageFiles(merged);
      setImagePreviews((prev) => [...prev, ...previews]);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Unable to add image.');
    }
  };

  if (effectiveStatus === 'SUBMITTED' || effectiveStatus === 'pending') {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-8 text-blue-500 animate-pulse">
          <ClockIcon className="w-12 h-12" />
        </div>
        <h1 className="text-3xl font-bold font-poppins text-[#0B1E3F]">Application Pending</h1>
        <p className="text-gray-500 mt-4 max-w-md mx-auto">
          Hang tight! Our Abuja team is currently verifying your documents. We'll notify you as soon as your shop is live.
        </p>
        <button 
          onClick={onRefreshStatus}
          className="mt-8 flex items-center gap-2 mx-auto text-[#F26A21] font-bold text-sm hover:underline"
        >
          <ArrowPathIcon className="w-4 h-4" />
          Refresh Status
        </button>
      </div>
    );
  }

  if (effectiveStatus === 'REJECTED' || effectiveStatus === 'rejected') {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8 text-red-500">
          <ExclamationCircleIcon className="w-12 h-12" />
        </div>
        <h1 className="text-3xl font-bold font-poppins text-[#0B1E3F]">Verification Declined</h1>
        <div className="mt-4 p-6 bg-red-50 text-red-700 rounded-3xl max-w-md mx-auto border border-red-100">
          <p className="text-sm font-bold uppercase mb-1">Reason for Rejection:</p>
          <p className="text-sm">{shopRejectionReason || applicationRejectionReason || user.rejectionReason || 'Documents provided were unclear or invalid.'}</p>
        </div>
        <button onClick={onReapply} className="mt-8 bg-[#0B1E3F] text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all">
          Re-apply with New Documents
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Stat Cards */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-[#0B1E3F] rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-xl">
            {user.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold font-poppins text-[#0B1E3F]">{user.name}</h1>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${statusClasses}`}>
                {statusLabel}
              </span>
              {statusLabel === 'Approved' && (
                <span className="bg-green-50 text-green-600 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border border-green-100 flex items-center gap-1">
                  <CheckBadgeIcon className="w-3 h-3" />
                  Verified Merchant
                </span>
              )}
            </div>
            <p className="text-gray-400 text-sm">Abuja Central • Active since {new Date().getFullYear()}</p>
          </div>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={onOpenTools}
            disabled={!canUseTools}
            title={!canUseTools ? 'Your shop must be approved to access business tools.' : undefined}
            className={`flex-1 md:flex-none px-6 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${
              canUseTools
                ? 'border-2 border-[#0B1E3F] text-[#0B1E3F] hover:bg-slate-50'
                : 'border-2 border-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <WrenchScrewdriverIcon className="w-6 h-6" />
            Business Tools
          </button>
          <button 
            onClick={handleOpenCreate}
            disabled={!canListItems}
            title={!canListItems ? 'Your seller account must be approved to list items.' : undefined}
            className={`flex-1 md:flex-none px-6 py-4 rounded-2xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 ${
              canListItems
                ? 'bg-[#F26A21] text-white shadow-orange-500/20 hover:bg-orange-600'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
            }`}
          >
            <PlusCircleIcon className="w-6 h-6" />
            List New Item
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 text-gray-400 mb-2">
            <ShoppingBagIcon className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest">Marketplace Items</span>
          </div>
          <p className="text-3xl font-bold text-[#0B1E3F]">{sellerProducts.length}</p>
          <p className="text-xs text-green-500 mt-2 font-medium">Items live in Abuja</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 text-gray-400 mb-2">
            <ArrowTrendingUpIcon className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest">Shop Rating</span>
          </div>
          <p className="text-3xl font-bold text-[#0B1E3F]">4.9</p>
          <p className="text-xs text-gray-400 mt-2 font-medium">Based on 12 verified reviews</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm bg-gradient-to-br from-[#0B1E3F] to-slate-800 text-white border-none">
          <div className="flex items-center gap-3 opacity-60 mb-2">
            <BuildingStorefrontIcon className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest">Store Health</span>
          </div>
          <p className="text-3xl font-bold">Excellent</p>
          <p className="text-xs opacity-60 mt-2 font-medium">All KYC verified</p>
        </div>
      </div>

      {/* Tools Promo Banner */}
      <div 
        onClick={onOpenTools}
        className={`rounded-[2.5rem] p-8 mb-12 border-2 border-dashed transition-all ${
          canUseTools
            ? 'bg-orange-50 border-orange-200 cursor-pointer group hover:bg-orange-100'
            : 'bg-gray-50 border-gray-200 cursor-not-allowed'
        }`}
      >
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-lg transition-transform ${
            canUseTools ? 'bg-[#F26A21] text-white group-hover:scale-110' : 'bg-gray-200 text-gray-400'
          }`}>
            <SparklesIcon className="w-8 h-8" />
          </div>
          <div className="flex-grow text-center md:text-left">
            <h3 className="text-xl font-bold text-[#0B1E3F]">Independent Business Suite</h3>
            <p className="text-sm text-[#0B1E3F]/60 mt-1">Track your offline store sales, calculate true net profit, and manage your stock room—all in one place.</p>
          </div>
          <button
            disabled={!canUseTools}
            className={`px-8 py-3 rounded-xl text-sm font-bold shadow-xl ${
              canUseTools ? 'bg-[#0B1E3F] text-white shadow-slate-900/10' : 'bg-gray-200 text-gray-400 shadow-none cursor-not-allowed'
            }`}
          >
            Open Tools
          </button>
        </div>
      </div>

      {/* Inventory Section */}
      <section>
        <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
          <h2 className="text-xl font-bold font-poppins text-[#0B1E3F]">Marketplace Listings</h2>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{sellerProducts.length} Items Listed</span>
        </div>
        
        {sellerProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sellerProducts.map(p => (
              <div key={p.id} className="bg-white p-4 rounded-3xl border border-gray-100 flex gap-4 hover:shadow-md transition-all group">
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0">
                  <img src={p.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                </div>
                <div className="flex-grow py-1">
                  <h4 className="font-bold text-[#0B1E3F] text-sm mb-1">{p.name}</h4>
                  <p className="text-xs text-[#F26A21] font-bold mb-2">₦{p.price.toLocaleString()}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-green-50 text-green-600">Live</span>
                    <button className="text-[10px] font-bold text-gray-400 hover:text-[#0B1E3F]">Edit</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200">
            <ShoppingBagIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400 font-medium">No items listed yet.</p>
            <button 
              onClick={handleOpenCreate}
              disabled={!canListItems}
              title={!canListItems ? 'Your seller account must be approved to list items.' : undefined}
              className={`mt-4 font-bold text-sm ${
                canListItems ? 'text-[#F26A21]' : 'text-gray-400 cursor-not-allowed'
              }`}
            >
              Post your first Grade-A item
            </button>
          </div>
        )}
      </section>

      {showCreateModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0B1E3F]/60 backdrop-blur-sm" onClick={handleCloseCreate}></div>
          <div className="relative bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-bold mb-6">Create Listing</h2>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Item Name</label>
                <input
                  type="text"
                  required
                  className="w-full bg-gray-50 p-3 rounded-xl border-none focus:ring-2 focus:ring-[#F26A21]"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="e.g. iPhone 12 UK Used"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Price (₦)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="w-full bg-gray-50 p-3 rounded-xl border-none focus:ring-2 focus:ring-[#F26A21]"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Condition</label>
                  <select
                    className="w-full bg-gray-50 p-3 rounded-xl border-none focus:ring-2 focus:ring-[#F26A21]"
                    value={newProduct.condition}
                    onChange={(e) => setNewProduct({ ...newProduct, condition: e.target.value as 'Like New' | 'Used' })}
                  >
                    <option value="Like New">Like New</option>
                    <option value="Used">Used</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Category</label>
                <select
                  required
                  className="w-full bg-gray-50 p-3 rounded-xl border-none focus:ring-2 focus:ring-[#F26A21]"
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                >
                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Description</label>
                <textarea
                  required
                  rows={4}
                  className="w-full bg-gray-50 p-3 rounded-xl border-none focus:ring-2 focus:ring-[#F26A21]"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  placeholder="Describe condition, accessories, and any defects."
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Images</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="w-full bg-gray-50 p-3 rounded-xl border-none focus:ring-2 focus:ring-[#F26A21]"
                  onChange={(e) => handleImageFiles(e.target.files)}
                />
                {imagePreviews.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {imagePreviews.map((src, idx) => (
                      <div key={`${src}-${idx}`} className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100">
                        <img src={src} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {formError && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl p-3">
                  {formError}
                </div>
              )}

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={handleCloseCreate}
                  className="flex-1 text-sm font-bold text-gray-400"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-[2] bg-[#F26A21] text-white py-3 rounded-xl font-bold disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Submit for Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerDashboardView;
