import React, { useState, useEffect } from 'react';
import { 
  BuildingStorefrontIcon, 
  IdentificationIcon, 
  CheckBadgeIcon, 
  ArrowUpTrayIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { Shop, User, ShopDocument } from '../types';
import { submitShopApplication, deleteShopDocument } from '../services/shopService';
import { FirestoreService } from '../services/firestoreService';

interface SellerOnboardingViewProps {
  user: User;
  shop: Shop | null;
  onCancel: () => void;
}

const SellerOnboardingView: React.FC<SellerOnboardingViewProps> = ({ user, shop, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    shopName: '',
    description: '',
    idDocument: null as File | null,
    cacDocument: null as File | null,
    addressDocument: null as File | null,
  });
  const [existingDocs, setExistingDocs] = useState<ShopDocument[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<ShopDocument | null>(null);
  const [undoVisible, setUndoVisible] = useState(false);
  const [deleteTimer, setDeleteTimer] = useState<number | null>(null);

  useEffect(() => {
    if (shop) {
      setFormData((prev) => ({
        ...prev,
        shopName: shop.shopName || '',
        description: shop.description || '',
      }));
    }
  }, [shop]);

  useEffect(() => {
    if (!shop?.id) return;
    setDocsLoading(true);
    FirestoreService.getShopDocuments(shop.id)
      .then((docs) => setExistingDocs(docs))
      .finally(() => setDocsLoading(false));
  }, [shop?.id]);

  useEffect(() => {
    return () => {
      if (deleteTimer) window.clearTimeout(deleteTimer);
    };
  }, [deleteTimer]);

  const isLocked = shop?.status === 'SUBMITTED' || shop?.status === 'UNDER_REVIEW';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      const hasExistingId = existingDocs.some((d) => d.documentType === 'ID');
      const hasExistingAddress = existingDocs.some((d) => d.documentType === 'ADDRESS');
      const needsId = !formData.idDocument && !hasExistingId;
      const needsAddress = !formData.addressDocument && !hasExistingAddress;

      if (!formData.shopName.trim() || !formData.description.trim() || needsId || needsAddress) {
        throw new Error('Complete all required fields.');
      }
      const payload = {
        ownerId: user.id,
        shopType: user.role === 'seller' ? 'seller' : 'buyer',
        shopName: formData.shopName.trim(),
        description: formData.description.trim(),
        documents: {
          id: formData.idDocument || undefined,
          cac: formData.cacDocument || undefined,
          address: formData.addressDocument || undefined,
        },
      };

      const hasNewDocs = !!formData.idDocument || !!formData.addressDocument || !!formData.cacDocument;
      if (hasNewDocs) {
        await submitShopApplication(payload, existingDocs);
      } else if (shop?.id) {
        await FirestoreService.updateShop(shop.id, { status: 'SUBMITTED', rejectionReason: '' });
      } else {
        throw new Error('Please upload required documents.');
      }
      setSuccess('Your shop application is under review.');
    } catch (err: any) {
      setError(err.message || 'Failed to submit application.');
    } finally {
      setLoading(false);
    }
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
          {shop?.status === 'REJECTED' && (
            <div className="bg-red-50 text-red-700 p-4 rounded-2xl text-xs border border-red-100">
              <p className="font-bold uppercase mb-1">Application Rejected</p>
              <p>{shop.rejectionReason || 'Your application needs updates. Please resubmit.'}</p>
            </div>
          )}
          {isLocked && (
            <div className="bg-blue-50 text-blue-700 p-4 rounded-2xl text-xs border border-blue-100">
              Your application is submitted. We will notify you when it is reviewed.
            </div>
          )}
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs border border-red-100">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 text-green-700 p-3 rounded-xl text-xs border border-green-100">
              {success}
            </div>
          )}
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
                  disabled={isLocked}
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
                  disabled={isLocked}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h3 className="text-lg font-bold text-[#0B1E3F] flex items-center gap-2">
              <IdentificationIcon className="w-5 h-5 text-[#F26A21]" />
              Verification Documents
            </h3>
            <p className="text-xs text-gray-400">Provide ID, proof of address, and CAC (if registering as a business).</p>
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-[11px] text-amber-700">
              <p className="font-bold uppercase tracking-widest text-[10px] mb-1">Tip</p>
              <p>Upload a clear photo or scan of your document.</p>
              <p>File must be JPG, PNG, or PDF and not more than 5MB.</p>
            </div>

            {docsLoading && (
              <div className="text-xs text-gray-400">Loading existing documents...</div>
            )}

            {existingDocs.length > 0 && (
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Existing Documents</p>
                <div className="flex flex-wrap gap-2">
                  {existingDocs.map((doc) => (
                    <div key={doc.id} className="bg-white px-3 py-1.5 rounded-full border border-gray-100 flex items-center gap-2">
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] font-bold text-[#0B1E3F] underline"
                      >
                        {doc.documentType}
                      </a>
                      <button
                        type="button"
                        className="text-[10px] font-bold text-red-500 hover:text-red-600"
                        onClick={async () => {
                          if (deleteTimer) {
                            window.clearTimeout(deleteTimer);
                            setDeleteTimer(null);
                          }
                          setPendingDelete(doc);
                          setExistingDocs((prev) => prev.filter((d) => d.id !== doc.id));
                          setUndoVisible(true);
                          const timer = window.setTimeout(async () => {
                            await deleteShopDocument(doc);
                            setPendingDelete(null);
                            setUndoVisible(false);
                            setDeleteTimer(null);
                          }, 5000);
                          setDeleteTimer(timer);
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Government ID</label>
                <div className="relative group">
                  <input 
                    type="file" 
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    onChange={e => setFormData({...formData, idDocument: e.target.files?.[0] || null})}
                    disabled={isLocked}
                  />
                  <div className={`p-4 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${formData.idDocument ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200 group-hover:border-[#F26A21]'}`}>
                    <ArrowUpTrayIcon className={`w-5 h-5 mb-1 ${formData.idDocument ? 'text-green-500' : 'text-gray-400'}`} />
                    <span className="text-[10px] font-bold text-gray-500 line-clamp-1">
                      {formData.idDocument ? formData.idDocument.name : 'Upload NIN/Passport'}
                    </span>
                  </div>
                </div>
                <p className="text-[10px] text-gray-400">Uploading a new ID will replace the existing document.</p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Proof of Address</label>
                <div className="relative group">
                  <input 
                    type="file" 
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    onChange={e => setFormData({...formData, addressDocument: e.target.files?.[0] || null})}
                    disabled={isLocked}
                  />
                  <div className={`p-4 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${formData.addressDocument ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200 group-hover:border-[#F26A21]'}`}>
                    <ArrowUpTrayIcon className={`w-5 h-5 mb-1 ${formData.addressDocument ? 'text-green-500' : 'text-gray-400'}`} />
                    <span className="text-[10px] font-bold text-gray-500 line-clamp-1">
                      {formData.addressDocument ? formData.addressDocument.name : 'Upload utility bill or bank statement'}
                    </span>
                  </div>
                </div>
                <p className="text-[10px] text-gray-400">Uploading a new address proof will replace the existing document.</p>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">CAC Document (Optional)</label>
              <div className="relative group">
                <input 
                  type="file" 
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  onChange={e => setFormData({...formData, cacDocument: e.target.files?.[0] || null})}
                  disabled={isLocked}
                />
                <div className={`p-4 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${formData.cacDocument ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200 group-hover:border-[#F26A21]'}`}>
                  <ArrowUpTrayIcon className={`w-5 h-5 mb-1 ${formData.cacDocument ? 'text-green-500' : 'text-gray-400'}`} />
                  <span className="text-[10px] font-bold text-gray-500 line-clamp-1">
                    {formData.cacDocument ? formData.cacDocument.name : 'Upload CAC if business'}
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-gray-400">Uploading a new CAC will replace the existing document.</p>
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
              disabled={loading || isLocked}
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

      {undoVisible && pendingDelete && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[140] bg-[#0B1E3F] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-4">
          <span className="text-xs font-bold">Document removed.</span>
          <button
            className="text-xs font-bold text-[#F26A21] hover:text-orange-300"
            onClick={() => {
              if (deleteTimer) window.clearTimeout(deleteTimer);
              setDeleteTimer(null);
              setExistingDocs((prev) => [pendingDelete, ...prev]);
              setPendingDelete(null);
              setUndoVisible(false);
            }}
          >
            Undo
          </button>
        </div>
      )}
    </div>
  );
};

export default SellerOnboardingView;
