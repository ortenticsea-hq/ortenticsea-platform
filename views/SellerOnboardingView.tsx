import React, { useState } from 'react';
import { 
  BuildingStorefrontIcon, 
  IdentificationIcon, 
  CheckBadgeIcon, 
  ArrowUpTrayIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

interface SellerOnboardingViewProps {
  onSubmit: (app: any) => void;
  onCancel: () => void;
}

const SellerOnboardingView: React.FC<SellerOnboardingViewProps> = ({ onSubmit, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    shopName: '',
    description: '',
    phone: '',
    email: '',
    idDocument: null as File | null,
    sourcingProof: null as File | null
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    onSubmit({
      ...formData,
      id: Math.random().toString(36).substr(2, 9),
      submittedAt: new Date().toISOString(),
      status: 'pending'
    });
    setLoading(false);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="mb-10 text-center">
        <div className="w-20 h-20 bg-orange-100 rounded-3xl flex items-center justify-center mx-auto mb-6 text-[#F26A21]">
          <BuildingStorefrontIcon className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-bold font-poppins text-[#0B1E3F]">Merchant Onboarding</h1>
        <p className="text-gray-500 mt-2">Join Abuja's most trusted network of Grade-A foreign-used sellers.</p>
      </div>

      <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-gray-100 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#F26A21]/5 rounded-full translate-x-16 -translate-y-16"></div>
        
        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-[#0B1E3F] flex items-center gap-2">
              <CheckBadgeIcon className="w-5 h-5 text-[#F26A21]" />
              Shop Information
            </h3>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Store Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Abuja Gadget Hub"
                  className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-[#F26A21] transition-all"
                  value={formData.shopName}
                  onChange={e => setFormData({...formData, shopName: e.target.value})}
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">About the Shop</label>
                <textarea 
                  required
                  placeholder="What kind of items do you specialize in?"
                  className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-[#F26A21] transition-all min-h-[100px] resize-none"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h3 className="text-lg font-bold text-[#0B1E3F] flex items-center gap-2">
              <IdentificationIcon className="w-5 h-5 text-[#F26A21]" />
              Verification Documents
            </h3>
            <p className="text-xs text-gray-400">To maintain marketplace quality, we require identity verification and proof of sourcing.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Government ID</label>
                <div className="relative group">
                  <input 
                    type="file" 
                    required
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    onChange={e => setFormData({...formData, idDocument: e.target.files?.[0] || null})}
                  />
                  <div className={`p-4 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${formData.idDocument ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200 group-hover:border-[#F26A21]'}`}>
                    <ArrowUpTrayIcon className={`w-5 h-5 mb-1 ${formData.idDocument ? 'text-green-500' : 'text-gray-400'}`} />
                    <span className="text-[10px] font-bold text-gray-500 line-clamp-1">
                      {formData.idDocument ? formData.idDocument.name : 'Upload NIN/Passport'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Sourcing Proof</label>
                <div className="relative group">
                  <input 
                    type="file" 
                    required
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    onChange={e => setFormData({...formData, sourcingProof: e.target.files?.[0] || null})}
                  />
                  <div className={`p-4 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${formData.sourcingProof ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200 group-hover:border-[#F26A21]'}`}>
                    <ArrowUpTrayIcon className={`w-5 h-5 mb-1 ${formData.sourcingProof ? 'text-green-500' : 'text-gray-400'}`} />
                    <span className="text-[10px] font-bold text-gray-500 line-clamp-1">
                      {formData.sourcingProof ? formData.sourcingProof.name : 'UK/US Receipt/Invoice'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <button 
              type="button" 
              onClick={onCancel}
              className="flex-1 py-4 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="flex-[2] bg-[#F26A21] text-white py-4 rounded-2xl font-bold shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Submitting...
                </>
              ) : 'Submit Application'}
            </button>
          </div>

          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-2xl">
            <ExclamationCircleIcon className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <p className="text-[10px] text-blue-700 leading-relaxed">
              Applications are reviewed by our Abuja verification team within 24-48 business hours. Ensure your documents are clear and valid.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SellerOnboardingView;
