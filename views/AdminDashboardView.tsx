
import React, { useState, useMemo } from 'react';
import { 
  ShieldCheckIcon, 
  UsersIcon, 
  ShoppingBagIcon, 
  ArrowRightIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  EyeIcon,
  DocumentMagnifyingGlassIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import { Product, Shop, ShopDocument, User } from '../types';
import { FirestoreService } from '../services/firestoreService';

interface AdminDashboardViewProps {
  products: Product[];
  shops: Shop[];
  onApproveProduct: (productId: string) => void;
  onRejectProduct: (productId: string, reason: string) => void;
  onApproveShop: (shopId: string) => void;
  onRejectShop: (shopId: string, reason: string) => void;
  onSetShopUnderReview: (shopId: string) => void;
}

type AdminTab = 'overview' | 'sellers' | 'products' | 'health' | 'safety';

const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ products, shops, onApproveProduct, onRejectProduct, onApproveShop, onRejectShop, onSetShopUnderReview }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [shopDocuments, setShopDocuments] = useState<ShopDocument[]>([]);
  const [shopOwner, setShopOwner] = useState<User | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [docPreview, setDocPreview] = useState<ShopDocument | null>(null);
  const [productRejectionReason, setProductRejectionReason] = useState('');
  const [showProductRejectModal, setShowProductRejectModal] = useState(false);
  const [shopRejectionReason, setShopRejectionReason] = useState('');
  const [showShopRejectModal, setShowShopRejectModal] = useState(false);
  const [shopFilter, setShopFilter] = useState<'SUBMITTED' | 'UNDER_REVIEW' | 'REJECTED' | 'APPROVED' | 'ALL'>('SUBMITTED');

  // Filter Data
  const pendingShops = useMemo(() => shops.filter(s => s.status === 'SUBMITTED'), [shops]);
  const filteredShops = useMemo(() => {
    if (shopFilter === 'ALL') return shops;
    return shops.filter(s => s.status === shopFilter);
  }, [shops, shopFilter]);
  const pendingProducts = useMemo(() => products.filter(p => p.status === 'pending'), [products]);

  // Summary Metrics
  const stats = [
    { label: 'Pending Shops', value: pendingShops.length, icon: UsersIcon, color: 'text-orange-500', tab: 'sellers' },
    { label: 'Pending Products', value: pendingProducts.length, icon: ShoppingBagIcon, color: 'text-blue-500', tab: 'products' },
    { label: 'Approved Listings', value: products.filter(p => p.status === 'approved').length, icon: CheckCircleIcon, color: 'text-green-500', tab: 'overview' },
    { label: 'Total Shops', value: shops.length, icon: ShieldCheckIcon, color: 'text-slate-600', tab: 'sellers' },
  ];

  const renderOverview = () => (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <button 
            key={stat.label}
            onClick={() => setActiveTab(stat.tab as AdminTab)}
            className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all text-left group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-2xl bg-gray-50 group-hover:scale-110 transition-transform`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <ArrowRightIcon className="w-4 h-4 text-gray-300 group-hover:text-gray-600" />
            </div>
            <p className="text-3xl font-black text-[#0B1E3F]">{stat.value}</p>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{stat.label}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <BellIcon className="w-5 h-5 text-[#F26A21]" />
            Recent Activity
          </h3>
          <div className="space-y-6">
            {pendingShops.slice(0, 3).map(shop => (
              <div key={shop.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-2xl transition-colors">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-[#F26A21] font-bold">
                  {shop.shopName.charAt(0)}
                </div>
                <div className="flex-grow">
                  <p className="text-sm font-bold text-[#0B1E3F]">{shop.shopName}</p>
                  <p className="text-xs text-gray-400">New shop application submitted</p>
                </div>
                <span className="text-[10px] font-bold text-gray-300">
                  {shop.createdAt ? new Date(shop.createdAt).toLocaleDateString() : '—'}
                </span>
              </div>
            ))}
            {pendingProducts.slice(0, 2).map(p => (
              <div key={p.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-2xl transition-colors">
                <div className="w-10 h-10 bg-blue-100 rounded-xl overflow-hidden">
                  <img src={p.images[0]} className="w-full h-full object-cover" />
                </div>
                <div className="flex-grow">
                  <p className="text-sm font-bold text-[#0B1E3F]">{p.name}</p>
                  <p className="text-xs text-gray-400">Product pending review</p>
                </div>
                <span className="text-[10px] font-bold text-gray-300">
                  {p.submittedAt ? new Date(p.submittedAt).toLocaleDateString() : '—'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#0B1E3F] rounded-[2.5rem] p-8 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <ShieldCheckIcon className="w-5 h-5 text-[#F26A21]" />
              Marketplace Snapshot
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Approved Shops</p>
                <p className="text-xl font-bold text-green-400">{shops.filter(s => s.status === 'APPROVED').length}</p>
              </div>
              <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Under Review</p>
                <p className="text-xl font-bold text-orange-400">{shops.filter(s => s.status === 'UNDER_REVIEW').length}</p>
              </div>
            </div>
            <div className="mt-8 p-4 bg-white/5 rounded-2xl border border-white/5">
              <p className="text-sm text-slate-300 leading-relaxed">
                Total listings: {products.length} • Pending approvals: {pendingProducts.length}
              </p>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#F26A21] rounded-full translate-x-32 -translate-y-32 opacity-5"></div>
        </div>
      </div>
    </div>
  );

  const renderSellers = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-100 flex flex-wrap gap-4 justify-between items-center">
          <div>
            <h2 className="text-xl font-bold font-poppins text-[#0B1E3F]">Merchant Onboarding</h2>
            <p className="text-sm text-gray-400 mt-1">Review pending merchant requests for Abuja Marketplace</p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Filter</label>
            <select
              className="text-xs font-bold bg-gray-50 border border-gray-100 rounded-xl px-3 py-2"
              value={shopFilter}
              onChange={(e) => setShopFilter(e.target.value as any)}
            >
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="ALL">All</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              <tr>
                <th className="px-8 py-4">Merchant Info</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4">Submitted</th>
                <th className="px-8 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredShops.length > 0 ? filteredShops.map((shop) => (
                <tr key={shop.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-[#F26A21] font-bold">
                        {shop.shopName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#0B1E3F]">{shop.shopName}</p>
                        <p className="text-xs text-gray-500">{shop.ownerId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                      shop.status === 'APPROVED'
                        ? 'bg-green-50 text-green-600 border-green-100'
                        : shop.status === 'SUBMITTED'
                          ? 'bg-blue-50 text-blue-600 border-blue-100'
                          : shop.status === 'UNDER_REVIEW'
                            ? 'bg-amber-50 text-amber-700 border-amber-100'
                            : 'bg-red-50 text-red-600 border-red-100'
                    }`}>
                      {shop.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-xs text-gray-500">
                    {shop.createdAt ? new Date(shop.createdAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={async () => {
                        setSelectedShop(shop);
                        const docs = await FirestoreService.getShopDocuments(shop.id);
                        setShopDocuments(docs);
                        const owner = await FirestoreService.getUserById(shop.ownerId);
                        setShopOwner(owner);
                      }}
                      className="p-2 text-gray-300 hover:text-[#F26A21] transition-colors"
                    >
                      <ArrowRightIcon className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={3} className="px-8 py-20 text-center text-gray-400 italic">No pending applications.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="lg:col-span-1">
        {selectedShop ? (
          <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl sticky top-24">
            <div className="flex justify-between items-start mb-6">
              <h3 className="font-bold text-lg">Application Detail</h3>
              <button onClick={() => setSelectedShop(null)} className="text-gray-400 hover:text-gray-600"><XCircleIcon className="w-6 h-6" /></button>
            </div>
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-2xl">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Shop Info</p>
                <p className="text-sm font-bold text-[#0B1E3F]">{selectedShop.shopName}</p>
                <p className="text-xs text-gray-500 mt-1">{selectedShop.description || 'No description provided.'}</p>
                <div className="mt-3 text-xs text-gray-500">
                  <p><span className="font-bold">Status:</span> {selectedShop.status}</p>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Owner</p>
                <p className="text-sm font-bold text-[#0B1E3F]">{shopOwner?.name || 'Unknown'}</p>
                <p className="text-xs text-gray-500">{shopOwner?.email || selectedShop.ownerId}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Documents</p>
                <div className="grid grid-cols-2 gap-2">
                  {shopDocuments.length === 0 && (
                    <div className="col-span-2 text-center text-xs text-gray-400 py-4">
                      No documents uploaded.
                    </div>
                  )}
                  {shopDocuments.map((doc) => (
                    <div key={doc.id} className="p-3 bg-white border border-gray-100 rounded-xl flex flex-col items-center gap-1">
                      <DocumentMagnifyingGlassIcon className={`w-5 h-5 ${doc.verified ? 'text-green-500' : 'text-gray-400'}`} />
                      <button
                        type="button"
                        onClick={() => setDocPreview(doc)}
                        className="text-[10px] font-bold text-[#0B1E3F] underline"
                      >
                        {doc.documentType}
                      </button>
                      <button
                        className="text-[9px] font-bold text-gray-400 hover:text-green-600"
                        onClick={async () => {
                          await FirestoreService.updateShopDocument(doc.id, { verified: !doc.verified });
                          const docs = await FirestoreService.getShopDocuments(selectedShop.id);
                          setShopDocuments(docs);
                        }}
                      >
                        {doc.verified ? 'Unverify' : 'Mark Verified'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-3 pt-6 border-t border-gray-100">
                <button 
                  onClick={() => { onApproveShop(selectedShop.id); setSelectedShop(null); }}
                  className="w-full bg-green-600 text-white py-3.5 rounded-2xl font-bold text-sm hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircleIcon className="w-5 h-5" /> Approve Shop
                </button>
                <button 
                  onClick={() => { onSetShopUnderReview(selectedShop.id); setSelectedShop(null); }}
                  className="w-full border border-slate-100 text-slate-600 py-3.5 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all"
                >
                  Set Under Review
                </button>
                <button 
                  onClick={() => setShowShopRejectModal(true)}
                  className="w-full border border-red-100 text-red-500 py-3.5 rounded-2xl font-bold text-sm hover:bg-red-50 transition-all"
                >
                  Reject with Reason
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-[2.5rem] p-12 border border-dashed border-gray-200 text-center text-gray-400">
            <UsersIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-sm font-medium">Select an application to begin verification.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderProducts = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold font-poppins text-[#0B1E3F]">Product Approval Queue</h2>
            <p className="text-sm text-gray-400 mt-1">Review Grade-A items before they go live on the marketplace.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 divide-y divide-gray-50">
          {pendingProducts.length > 0 ? pendingProducts.map(p => (
            <div key={p.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl overflow-hidden shadow-sm">
                  <img src={p.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                </div>
                <div>
                  <p className="font-bold text-[#0B1E3F]">{p.name}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] font-bold text-[#F26A21] uppercase tracking-widest">{p.category}</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">₦{p.price.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedProduct(p)}
                className="bg-gray-100 p-3 rounded-2xl text-[#0B1E3F] hover:bg-[#F26A21] hover:text-white transition-all shadow-sm"
              >
                <EyeIcon className="w-5 h-5" />
              </button>
            </div>
          )) : (
            <div className="p-20 text-center text-gray-400">All products have been reviewed!</div>
          )}
        </div>
      </div>

      <div className="lg:col-span-1">
        {selectedProduct ? (
          <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl sticky top-24">
             <div className="flex justify-between items-start mb-6">
                <h3 className="font-bold text-lg">Product Review</h3>
                <button onClick={() => setSelectedProduct(null)} className="text-gray-400 hover:text-gray-600"><XCircleIcon className="w-6 h-6" /></button>
             </div>
             <div className="aspect-square rounded-2xl overflow-hidden mb-6 bg-gray-50">
                <img src={selectedProduct.images[0]} className="w-full h-full object-cover" />
             </div>
             <div className="space-y-4 mb-8">
                <div>
                   <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Description</label>
                   <p className="text-xs text-gray-600 leading-relaxed mt-1 line-clamp-3">{selectedProduct.description}</p>
                </div>
                <div>
                   <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Condition</label>
                   <p className="text-sm font-bold text-[#0B1E3F]">{selectedProduct.condition} (Grade-A)</p>
                </div>
             </div>
             <div className="space-y-3">
                <button 
                  onClick={() => { onApproveProduct(selectedProduct.id); setSelectedProduct(null); }}
                  className="w-full bg-green-600 text-white py-3.5 rounded-2xl font-bold text-sm hover:bg-green-700 transition-all shadow-lg shadow-green-500/10"
                >
                  Approve Listing
                </button>
                <button 
                  onClick={() => setShowProductRejectModal(true)}
                  className="w-full border border-red-100 text-red-500 py-3.5 rounded-2xl font-bold text-sm hover:bg-red-50 transition-all"
                >
                  Reject & Notify Seller
                </button>
             </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-[2.5rem] p-12 border border-dashed border-gray-200 text-center text-gray-400">
             <ShoppingBagIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
             <p className="text-sm font-medium">Review pending listings to keep the marketplace clean.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderHealth = () => (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
        <h2 className="text-xl font-bold font-poppins text-[#0B1E3F] mb-8">Marketplace Health</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Approved Shops</p>
            <p className="text-2xl font-bold text-[#0B1E3F]">{shops.filter(s => s.status === 'APPROVED').length}</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Under Review</p>
            <p className="text-2xl font-bold text-[#0B1E3F]">{shops.filter(s => s.status === 'UNDER_REVIEW').length}</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Rejected</p>
            <p className="text-2xl font-bold text-[#0B1E3F]">{shops.filter(s => s.status === 'REJECTED').length}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSafety = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-100">
          <h2 className="text-xl font-bold font-poppins text-[#0B1E3F]">Trust & Safety Panel</h2>
          <p className="text-sm text-gray-400 mt-1">No safety reports available yet.</p>
        </div>
        <div className="p-20 text-center text-gray-400 italic">No open reports.</div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch(activeTab) {
      case 'overview': return renderOverview();
      case 'sellers': return renderSellers();
      case 'products': return renderProducts();
      case 'health': return renderHealth();
      case 'safety': return renderSafety();
      default: return renderOverview();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-10 bg-white/50 p-2 rounded-[2rem] border border-gray-100 sticky top-24 z-20 backdrop-blur-md">
        {(['overview', 'sellers', 'products', 'health', 'safety'] as AdminTab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-8 py-3.5 rounded-[1.5rem] text-sm font-black transition-all uppercase tracking-widest ${
              activeTab === tab 
              ? 'bg-[#0B1E3F] text-white shadow-xl shadow-[#0B1E3F]/20' 
              : 'text-gray-400 hover:text-[#0B1E3F] hover:bg-gray-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {renderContent()}

      {showProductRejectModal && selectedProduct && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0B1E3F]/60 backdrop-blur-sm" onClick={() => setShowProductRejectModal(false)}></div>
          <div className="relative bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl scale-in-center">
            <h3 className="text-xl font-bold font-poppins text-[#0B1E3F] mb-4">Rejection Reason</h3>
            <p className="text-sm text-gray-500 mb-6">Explain why this product listing was declined.</p>
            <textarea 
              className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-red-500 min-h-[120px] mb-6 resize-none shadow-inner"
              placeholder="e.g. Photos are unclear or description is incomplete..."
              value={productRejectionReason}
              onChange={(e) => setProductRejectionReason(e.target.value)}
            />
            <div className="flex gap-4">
              <button
                onClick={() => setShowProductRejectModal(false)}
                className="flex-1 py-3 font-bold text-gray-400 uppercase tracking-widest text-[10px]"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (!productRejectionReason.trim()) return;
                  onRejectProduct(selectedProduct.id, productRejectionReason.trim());
                  setShowProductRejectModal(false);
                  setSelectedProduct(null);
                  setProductRejectionReason('');
                }}
                className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-red-500/10 uppercase tracking-widest text-[10px]"
                disabled={!productRejectionReason.trim()}
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {showShopRejectModal && selectedShop && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0B1E3F]/60 backdrop-blur-sm" onClick={() => setShowShopRejectModal(false)}></div>
          <div className="relative bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl scale-in-center">
            <h3 className="text-xl font-bold font-poppins text-[#0B1E3F] mb-4">Rejection Reason</h3>
            <p className="text-sm text-gray-500 mb-6">Explain why {selectedShop.shopName} was declined.</p>
            <textarea 
              className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-red-500 min-h-[120px] mb-6 resize-none shadow-inner"
              placeholder="e.g. Documents are unclear or incomplete..."
              value={shopRejectionReason}
              onChange={(e) => setShopRejectionReason(e.target.value)}
            />
            <div className="flex gap-4">
              <button onClick={() => setShowShopRejectModal(false)} className="flex-1 py-3 font-bold text-gray-400 uppercase tracking-widest text-[10px]">Cancel</button>
              <button 
                onClick={() => {
                  if (!shopRejectionReason.trim()) return;
                  onRejectShop(selectedShop.id, shopRejectionReason.trim());
                  setShowShopRejectModal(false);
                  setSelectedShop(null);
                  setShopRejectionReason('');
                }}
                className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-red-500/10 uppercase tracking-widest text-[10px]"
                disabled={!shopRejectionReason.trim()}
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {docPreview && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0B1E3F]/60 backdrop-blur-sm" onClick={() => setDocPreview(null)}></div>
          <div className="relative bg-white w-full max-w-3xl rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#0B1E3F]">Document Preview • {docPreview.documentType}</h3>
              <button onClick={() => setDocPreview(null)} className="text-gray-400 hover:text-gray-600"><XCircleIcon className="w-6 h-6" /></button>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4">
              {docPreview.fileUrl.toLowerCase().endsWith('.pdf') ? (
                <iframe title="Document Preview" src={docPreview.fileUrl} className="w-full h-[60vh] rounded-xl border border-gray-100"></iframe>
              ) : (
                <img src={docPreview.fileUrl} alt="Document Preview" className="w-full max-h-[60vh] object-contain rounded-xl" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardView;
