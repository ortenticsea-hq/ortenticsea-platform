
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
  ChartBarIcon,
  ExclamationTriangleIcon,
  BellIcon,
  ClockIcon,
  FunnelIcon,
  NoSymbolIcon,
  HomeModernIcon
} from '@heroicons/react/24/outline';
import { SellerApplication, Product, Report, Seller } from '../types';
import { PRODUCTS, REPORTS, SELLERS } from '../constants.tsx';

interface AdminDashboardViewProps {
  applications: SellerApplication[];
  onApprove: (appId: string) => void;
  onReject: (appId: string, reason: string) => void;
}

type AdminTab = 'overview' | 'sellers' | 'products' | 'health' | 'safety';

const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ applications, onApprove, onReject }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [selectedApp, setSelectedApp] = useState<SellerApplication | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  // Filter Data
  const pendingApps = useMemo(() => applications.filter(a => a.status === 'pending'), [applications]);
  const pendingProducts = useMemo(() => PRODUCTS.filter(p => p.status === 'pending_approval'), []);
  const activeReports = useMemo(() => REPORTS.filter(r => r.status === 'open'), []);

  // Summary Metrics
  const stats = [
    { label: 'Pending Sellers', value: pendingApps.length, icon: UsersIcon, color: 'text-orange-500', tab: 'sellers' },
    { label: 'Pending Products', value: pendingProducts.length, icon: ShoppingBagIcon, color: 'text-blue-500', tab: 'products' },
    { label: 'Live Listings', value: PRODUCTS.filter(p => p.status === 'live').length, icon: CheckCircleIcon, color: 'text-green-500', tab: 'overview' },
    { label: 'Safety Flags', value: activeReports.length, icon: ExclamationTriangleIcon, color: 'text-red-500', tab: 'safety' },
  ];

  const handleApproveProduct = (id: string) => {
    alert(`Product ${id} has been approved and is now live.`);
    setSelectedProduct(null);
  };

  const handleRejectProduct = (id: string) => {
    alert(`Product ${id} has been rejected.`);
    setSelectedProduct(null);
  };

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
            {pendingApps.slice(0, 3).map(app => (
              <div key={app.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-2xl transition-colors">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-[#F26A21] font-bold">
                  {app.shopName.charAt(0)}
                </div>
                <div className="flex-grow">
                  <p className="text-sm font-bold text-[#0B1E3F]">{app.shopName}</p>
                  <p className="text-xs text-gray-400">New seller application submitted</p>
                </div>
                <span className="text-[10px] font-bold text-gray-300">Today</span>
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
                <span className="text-[10px] font-bold text-gray-300">2h ago</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#0B1E3F] rounded-[2.5rem] p-8 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <ShieldCheckIcon className="w-5 h-5 text-[#F26A21]" />
              Platform Status
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Server Health</p>
                <p className="text-xl font-bold text-green-400">99.9% Uptime</p>
              </div>
              <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Security Score</p>
                <p className="text-xl font-bold text-orange-400">Excellent</p>
              </div>
            </div>
            <div className="mt-8 p-4 bg-white/5 rounded-2xl border border-white/5">
              <p className="text-sm text-slate-300 leading-relaxed italic">
                "Trust is our currency in Abuja. Every verification matters."
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
        <div className="p-8 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold font-poppins text-[#0B1E3F]">Merchant Onboarding</h2>
            <p className="text-sm text-gray-400 mt-1">Review pending merchant requests for Abuja Marketplace</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              <tr>
                <th className="px-8 py-4">Merchant Info</th>
                <th className="px-8 py-4">Submitted</th>
                <th className="px-8 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pendingApps.length > 0 ? pendingApps.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-[#F26A21] font-bold">
                        {app.shopName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#0B1E3F]">{app.shopName}</p>
                        <p className="text-xs text-gray-500">{app.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-xs text-gray-500">
                    {new Date(app.submittedAt).toLocaleDateString()}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => setSelectedApp(app)}
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
        {selectedApp ? (
          <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl sticky top-24">
            <div className="flex justify-between items-start mb-6">
              <h3 className="font-bold text-lg">Application Detail</h3>
              <button onClick={() => setSelectedApp(null)} className="text-gray-400 hover:text-gray-600"><XCircleIcon className="w-6 h-6" /></button>
            </div>
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-2xl">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Documents</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-white border border-gray-100 rounded-xl flex flex-col items-center gap-1">
                    <DocumentMagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-[10px] font-bold">ID Copy</span>
                  </div>
                  <div className="p-3 bg-white border border-gray-100 rounded-xl flex flex-col items-center gap-1">
                    <ChartBarIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-[10px] font-bold">Sourcing</span>
                  </div>
                </div>
              </div>
              <div className="space-y-3 pt-6 border-t border-gray-100">
                <button 
                  onClick={() => { onApprove(selectedApp.id); setSelectedApp(null); }}
                  className="w-full bg-green-600 text-white py-3.5 rounded-2xl font-bold text-sm hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircleIcon className="w-5 h-5" /> Approve Shop
                </button>
                <button 
                  onClick={() => setShowRejectModal(true)}
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
                  onClick={() => handleApproveProduct(selectedProduct.id)}
                  className="w-full bg-green-600 text-white py-3.5 rounded-2xl font-bold text-sm hover:bg-green-700 transition-all shadow-lg shadow-green-500/10"
                >
                  Approve Listing
                </button>
                <button 
                  onClick={() => handleRejectProduct(selectedProduct.id)}
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
        <h2 className="text-xl font-bold font-poppins text-[#0B1E3F] mb-8">Marketplace Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100">
             <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Volume by Category</h4>
             <div className="space-y-4">
                {['Phones', 'Laptops', 'Denim Jeans', 'Appliances'].map(cat => (
                  <div key={cat}>
                    <div className="flex justify-between text-xs font-bold mb-2">
                       <span>{cat}</span>
                       <span className="text-[#F26A21]">65%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                       <div className="h-full bg-[#0B1E3F] rounded-full" style={{ width: `${Math.random() * 80 + 20}%` }}></div>
                    </div>
                  </div>
                ))}
             </div>
          </div>
          <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 flex flex-col items-center justify-center text-center">
             <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4">
                <HomeModernIcon className="w-10 h-10" />
             </div>
             <p className="text-xl font-bold text-[#0B1E3F]">Abuja Hub Dominance</p>
             <p className="text-xs text-gray-400 mt-2">Wuse 2 remains the top performing sourcing district this month.</p>
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
          <p className="text-sm text-gray-400 mt-1">Review flagged listings and seller reports.</p>
        </div>
        <div className="divide-y divide-gray-50">
          {activeReports.length > 0 ? activeReports.map(report => (
            <div key={report.id} className="p-8 flex items-start gap-4 hover:bg-red-50/30 transition-all">
              <div className="p-3 bg-red-100 rounded-2xl text-red-600">
                <ExclamationTriangleIcon className="w-6 h-6" />
              </div>
              <div className="flex-grow">
                <div className="flex justify-between items-start mb-2">
                   <p className="font-bold text-[#0B1E3F]">Report against {report.targetType}: {report.targetId}</p>
                   <span className="text-[10px] font-bold text-gray-300 uppercase">{new Date(report.timestamp).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-gray-600 bg-white border border-gray-100 p-4 rounded-2xl italic leading-relaxed">
                   "{report.reason}"
                </p>
                <p className="text-[10px] font-bold text-slate-400 mt-4 uppercase tracking-widest">Reporter: {report.reporterName}</p>
              </div>
              <div className="flex flex-col gap-2">
                 <button className="bg-[#0B1E3F] text-white p-3 rounded-2xl hover:bg-slate-800 transition-all shadow-sm"><ShieldCheckIcon className="w-5 h-5" /></button>
                 <button className="bg-red-600 text-white p-3 rounded-2xl hover:bg-red-700 transition-all shadow-sm"><NoSymbolIcon className="w-5 h-5" /></button>
              </div>
            </div>
          )) : (
            <div className="p-20 text-center text-gray-400 italic">No open reports. Abuja is safe!</div>
          )}
        </div>
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

      {/* Reject Modal */}
      {showRejectModal && selectedApp && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0B1E3F]/60 backdrop-blur-sm" onClick={() => setShowRejectModal(false)}></div>
          <div className="relative bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl scale-in-center">
            <h3 className="text-xl font-bold font-poppins text-[#0B1E3F] mb-4">Rejection Reason</h3>
            <p className="text-sm text-gray-500 mb-6">Explain to {selectedApp.shopName} why their application was declined.</p>
            <textarea 
              className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-red-500 min-h-[120px] mb-6 resize-none shadow-inner"
              placeholder="e.g. ID document provided is expired or blurry..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
            <div className="flex gap-4">
              <button onClick={() => setShowRejectModal(false)} className="flex-1 py-3 font-bold text-gray-400 uppercase tracking-widest text-[10px]">Cancel</button>
              <button 
                onClick={() => {
                  onReject(selectedApp.id, rejectionReason);
                  setShowRejectModal(false);
                  setSelectedApp(null);
                  setRejectionReason('');
                }}
                className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-red-500/10 uppercase tracking-widest text-[10px]"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardView;
