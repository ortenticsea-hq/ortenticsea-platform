
import { InventoryItem, CashflowSnapshot } from '../types';

const STORAGE_KEY = 'ortenticsea_seller_inventory_v1';

export const SellerToolsService = {
  getItems: (): InventoryItem[] => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  },

  saveItem: (item: InventoryItem) => {
    const items = SellerToolsService.getItems();
    const index = items.findIndex(i => i.id === item.id);
    if (index > -1) {
      items[index] = item;
    } else {
      items.push(item);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  },

  deleteItem: (id: string) => {
    const items = SellerToolsService.getItems().filter(i => i.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  },

  calculateCashflow: (): CashflowSnapshot => {
    const items = SellerToolsService.getItems();
    
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

  getAgingInventory: (days: number = 30): InventoryItem[] => {
    const items = SellerToolsService.getItems();
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
