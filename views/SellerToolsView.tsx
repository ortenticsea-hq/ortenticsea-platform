import React, { useState, useEffect, useMemo } from 'react';
import { 
  CurrencyDollarIcon, 
  ArchiveBoxIcon, 
  ChartBarIcon, 
  PlusIcon,
  MapPinIcon,
  CalendarIcon,
  TagIcon,
  TrashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { InventoryItem, CashflowSnapshot } from '../types';
import { SellerToolsService } from '../services/sellerToolsService.ts';

interface SellerToolsViewProps {
  onBack: () => void;
}

const SellerToolsView: React.FC<SellerToolsViewProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'finance'>('inventory');
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);

  // New Item Form State
  const [newItem, setNewItem] = useState<Partial<InventoryItem>>({
    name: '',
    purchasePrice: 0,
    expectedPrice: 0,
    location: '',
    category: 'Phones',
    expenses: []
  });

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setItems(SellerToolsService.getItems());
  };

  const cashflow = useMemo(() => SellerToolsService.calculateCashflow(), [items]);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    const item: InventoryItem = {
      ...newItem as InventoryItem,
      id: Date.now().toString(),
      dateAcquired: new Date().toISOString(),
      status: 'available',
      expenses: newItem.expenses || []
    };
    SellerToolsService.saveItem(item);
    refreshData();
    setShowAddModal(false);
    setNewItem({ name: '', purchasePrice: 0, expectedPrice: 0, location: '', category: 'Phones', expenses: [] });
  };

  const markAsSold = (item: InventoryItem) => {
    const price = prompt(`Enter actual sold price for ${item.name}:`, item.expectedPrice.toString());
    if (price) {
      const updated = { 
        ...item, 
        status: 'sold' as const, 
        soldPrice: parseFloat(price), 
        dateSold: new Date().toISOString() 
      };
      SellerToolsService.saveItem(updated);
      refreshData();
    }
  };

  const getAiInsight = async () => {
    setIsAiLoading(true);
    setAiInsight(null);
    
    const agingItems = SellerToolsService.getAgingInventory(14);
    if (agingItems.length === 0) {
      setAiInsight("Your inventory is moving well! No stale items found. Keep sourcing Grade-A items.");
      setIsAiLoading(false);
      return;
    }

    const inventorySummary = agingItems.map(i => `${i.name} (Held for ${Math.ceil((Date.now() - new Date(i.dateAcquired).getTime()) / (1000*60*60*24))} days, Cost: ₦${i.purchasePrice})`).join(', ');
    
    try {
      // Mocking Gemini logic here for flow - in production this would call ai.models.generateContent
      setTimeout(() => {
        setAiInsight(`O-Assist Insight: You have ${agingItems.length} items sitting for over 2 weeks. I suggest dropping the price of '${agingItems[0].name}' by 5% to trigger a quick sale in the Wuse market. This would free up ₦${agingItems[0].purchasePrice} in capital.`);
        setIsAiLoading(false);
      }, 1500);
    } catch (e) {
      setAiInsight("Unable to generate insights right now.");
      setIsAiLoading(false);
    }
  };

  const renderInventory = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <ArchiveBoxIcon className="w-6 h-6 text-[#F26A21]" />
          Inventory Brain
        </h2>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-[#0B1E3F] text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" /> Add Stock
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.filter(i => i.status === 'available').map(item => {
          const daysHeld = Math.ceil((Date.now() - new Date(item.dateAcquired).getTime()) / (1000 * 60 * 60 * 24));
          const isAging = daysHeld > 30;
          
          return (
            <div key={item.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative group">
              {isAging && (
                <div className="absolute top-3 right-3 flex items-center gap-1 text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full text-[10px] font-bold">
                  <ExclamationTriangleIcon className="w-3 h-3" /> Aging
                </div>
              )}
              <h3 className="font-bold text-[#0B1E3F] mb-1">{item.name}</h3>
              <p className="text-xs text-gray-400 mb-4">{item.category} • {item.location}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 p-2 rounded-lg">
                  <p className="text-[9px] uppercase text-gray-400 font-bold">Cost</p>
                  <p className="text-sm font-bold">₦{item.purchasePrice.toLocaleString()}</p>
                </div>
                <div className="bg-orange-50 p-2 rounded-lg">
                  <p className="text-[9px] uppercase text-orange-400 font-bold">Target</p>
                  <p className="text-sm font-bold text-[#F26A21]">₦{item.expectedPrice.toLocaleString()}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                <span className="text-[10px] text-gray-400 font-medium">Held: {daysHeld} days</span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => SellerToolsService.deleteItem(item.id)}
                    className="p-1.5 text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => markAsSold(item)}
                    className="bg-green-500 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold"
                  >
                    Mark Sold
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderFinance = () => (
    <div className="space-y-8">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <CurrencyDollarIcon className="w-6 h-6 text-green-500" />
        Finance Tracker
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Net Profit</p>
          <p className={`text-3xl font-black ${cashflow.netProfit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            ₦{cashflow.netProfit.toLocaleString()}
          </p>
        </div>
        <div className="bg-[#0B1E3F] p-6 rounded-3xl text-white shadow-xl shadow-[#0B1E3F]/10">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Capital Tied Up</p>
          <p className="text-3xl font-black">₦{cashflow.tiedUpCapital.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Pending Revenue</p>
          <p className="text-3xl font-black text-[#0B1E3F]">₦{cashflow.expectedRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-orange-50 p-6 rounded-3xl border border-orange-100">
          <p className="text-xs font-bold text-[#F26A21] uppercase tracking-widest mb-1">Unsold Stock</p>
          <p className="text-3xl font-black text-[#F26A21]">{items.filter(i => i.status === 'available').length}</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="font-bold text-[#0B1E3F]">Recent Sales History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              <tr>
                <th className="px-6 py-4">Item</th>
                <th className="px-6 py-4">Cost</th>
                <th className="px-6 py-4">Sold For</th>
                <th className="px-6 py-4">Profit</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.filter(i => i.status === 'sold').sort((a,b) => new Date(b.dateSold!).getTime() - new Date(a.dateSold!).getTime()).map(item => {
                const cost = item.purchasePrice + item.expenses.reduce((s,e) => s+e.amount, 0);
                const profit = (item.soldPrice || 0) - cost;
                return (
                  <tr key={item.id} className="text-sm">
                    <td className="px-6 py-4 font-bold">{item.name}</td>
                    <td className="px-6 py-4 text-gray-500">₦{cost.toLocaleString()}</td>
                    <td className="px-6 py-4 font-bold text-green-600">₦{item.soldPrice?.toLocaleString()}</td>
                    <td className={`px-6 py-4 font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                      ₦{profit.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs">
                      {new Date(item.dateSold!).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl min-h-screen">
      <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-[#0B1E3F] mb-8 transition-colors">
        <ArrowLeftIcon className="w-4 h-4" /> Back to Dashboard
      </button>

      <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black font-poppins text-[#0B1E3F]">Seller Success Suite</h1>
          <p className="text-gray-500 mt-1">Manage your shop finances and stock room</p>
        </div>

        <div className="flex bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm">
          <button 
            onClick={() => setActiveTab('inventory')}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'inventory' ? 'bg-[#0B1E3F] text-white' : 'text-gray-400'}`}
          >
            Inventory Brain
          </button>
          <button 
            onClick={() => setActiveTab('finance')}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'finance' ? 'bg-[#0B1E3F] text-white' : 'text-gray-400'}`}
          >
            Finance Hub
          </button>
        </div>
      </div>

      {/* AI Insights Bar */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 p-5 rounded-[2rem] mb-12 flex flex-col md:flex-row items-center gap-6 shadow-sm">
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-md text-blue-600 flex-shrink-0">
          <SparklesIcon className="w-6 h-6" />
        </div>
        <div className="flex-grow">
          <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">O-Assist Intelligence</p>
          <p className="text-sm text-blue-900 leading-relaxed">
            {aiInsight || "Click to analyze your current stock performance and profit trends."}
          </p>
        </div>
        {/* Fixed: Removed duplicate onClick attribute and fixed undefined getOAssistResponse reference */}
        <button 
          onClick={getAiInsight}
          disabled={isAiLoading}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 whitespace-nowrap disabled:opacity-50"
        >
          {isAiLoading ? 'Analyzing...' : 'Generate Insights'}
        </button>
      </div>

      {activeTab === 'inventory' ? renderInventory() : renderFinance()}

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0B1E3F]/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)}></div>
          <div className="relative bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-bold mb-6">Add New Stock</h2>
            <form onSubmit={handleAddItem} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Item Name</label>
                <input 
                  type="text" 
                  required
                  className="w-full bg-gray-50 p-3 rounded-xl border-none focus:ring-2 focus:ring-[#F26A21]"
                  value={newItem.name}
                  onChange={e => setNewItem({...newItem, name: e.target.value})}
                  placeholder="e.g. iPhone 12 UK Used"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Buy Price (₦)</label>
                  <input 
                    type="number" 
                    required
                    className="w-full bg-gray-50 p-3 rounded-xl border-none focus:ring-2 focus:ring-[#F26A21]"
                    value={newItem.purchasePrice}
                    onChange={e => setNewItem({...newItem, purchasePrice: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Target Price (₦)</label>
                  <input 
                    type="number" 
                    required
                    className="w-full bg-gray-50 p-3 rounded-xl border-none focus:ring-2 focus:ring-[#F26A21]"
                    value={newItem.expectedPrice}
                    onChange={e => setNewItem({...newItem, expectedPrice: parseFloat(e.target.value)})}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Storage Location</label>
                <input 
                  type="text" 
                  required
                  className="w-full bg-gray-50 p-3 rounded-xl border-none focus:ring-2 focus:ring-[#F26A21]"
                  value={newItem.location}
                  onChange={e => setNewItem({...newItem, location: e.target.value})}
                  placeholder="e.g. Wuse 2 Shop, Drawer A"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 text-sm font-bold text-gray-400">Cancel</button>
                <button type="submit" className="flex-[2] bg-[#F26A21] text-white py-3 rounded-xl font-bold">Add to Stock</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerToolsView;