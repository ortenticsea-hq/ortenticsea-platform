
import { InventoryItem, CashflowSnapshot } from '../types';
import { FirestoreService } from './firestoreService';

const STORAGE_KEY = 'ortenticsea_seller_inventory_v1';

export const SellerToolsService = {
  /**
   * Get items from Firestore for a specific seller
   * Falls back to localStorage for backward compatibility
   */
  getItems: async (sellerId: string): Promise<InventoryItem[]> => {
    try {
      // Try to get from Firestore first
      const items = await FirestoreService.getInventoryItems(sellerId);
      return items;
    } catch (error) {
      console.error('Error fetching inventory from Firestore:', error);
      // Fallback to localStorage
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    }
  },

  /**
   * Save item to Firestore
   * Also saves to localStorage for backward compatibility
   */
  saveItem: async (sellerId: string, item: InventoryItem): Promise<void> => {
    try {
      await FirestoreService.saveInventoryItem(sellerId, item);
      
      // Also update localStorage for backward compatibility
      const saved = localStorage.getItem(STORAGE_KEY);
      const items = saved ? JSON.parse(saved) : [];
      const index = items.findIndex((i: InventoryItem) => i.id === item.id);
      if (index > -1) {
        items[index] = item;
      } else {
        items.push(item);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving inventory item:', error);
      throw error;
    }
  },

  /**
   * Delete item from Firestore
   * Also removes from localStorage for backward compatibility
   */
  deleteItem: async (id: string): Promise<void> => {
    try {
      await FirestoreService.deleteInventoryItem(id);
      
      // Also update localStorage for backward compatibility
      const saved = localStorage.getItem(STORAGE_KEY);
      const items = saved ? JSON.parse(saved) : [];
      const filtered = items.filter((i: InventoryItem) => i.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      throw error;
    }
  },

  /**
   * Calculate cashflow from inventory items
   */
  calculateCashflow: (items: InventoryItem[]): CashflowSnapshot => {
    return items.reduce((acc, item) => {
      const itemCosts = item.purchasePrice + item.expenses.reduce((sum, e) => sum + e.amount, 0);
      
      if (item.status === 'sold') {
        acc.netProfit += (item.soldPrice || 0) - itemCosts;
      } else {
        acc.tiedUpCapital += itemCosts;
        acc.expectedRevenue += item.expectedPrice;
      }
      
      return acc;
    }, {
      totalCapital: 0,
      expectedRevenue: 0,
      netProfit: 0,
      tiedUpCapital: 0
    });
  },

  /**
   * Get aging inventory items
   */
  getAgingInventory: (items: InventoryItem[], days: number = 30): InventoryItem[] => {
    const now = new Date();
    return items.filter(item => {
      if (item.status === 'sold') return false;
      const acquired = new Date(item.dateAcquired);
      const diffTime = Math.abs(now.getTime() - acquired.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= days;
    });
  }
};
