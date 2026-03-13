import React, { useMemo, useState } from 'react';
import { Order, OrderStatus, User } from '../types';
import { useOrders, useOrdersByBuyer } from '../hooks/useFirestore';
import { FirestoreService } from '../services/firestoreService';
import { TruckIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

interface OrdersViewProps {
  currentUser: User;
  isAdmin: boolean;
}

const statusBadge = (status: OrderStatus) => {
  switch (status) {
    case 'paid':
      return 'bg-blue-50 text-blue-600 border-blue-100';
    case 'shipped':
      return 'bg-amber-50 text-amber-700 border-amber-100';
    case 'delivered':
      return 'bg-green-50 text-green-600 border-green-100';
    default:
      return 'bg-gray-50 text-gray-500 border-gray-100';
  }
};

const OrdersView: React.FC<OrdersViewProps> = ({ currentUser, isAdmin }) => {
  const { orders: buyerOrders, loading: buyerLoading } = useOrdersByBuyer(isAdmin ? null : currentUser.id);
  const { orders: allOrders, loading: adminLoading } = useOrders(isAdmin);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const orders = useMemo(() => {
    const list = isAdmin ? allOrders : buyerOrders;
    return [...list].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  }, [allOrders, buyerOrders, isAdmin]);

  const isLoading = isAdmin ? adminLoading : buyerLoading;

  const handleAdminStatusUpdate = async (order: Order, status: OrderStatus) => {
    if (status === order.status) return;
    setUpdatingId(order.id);
    try {
      await FirestoreService.updateOrder(order.id, {
        status,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to update order status:', error);
      alert('Unable to update order status right now.');
    } finally {
      setUpdatingId(null);
    }
  };

  const nextStatusOptions = (status: OrderStatus): OrderStatus[] => {
    if (status === 'paid') return ['paid', 'shipped', 'delivered'];
    if (status === 'shipped') return ['shipped', 'delivered'];
    if (status === 'delivered') return ['delivered'];
    return ['pending'];
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-500">
          Loading orders...
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold font-poppins text-[#0B1E3F]">
            {isAdmin ? 'All Orders' : 'My Orders'}
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            {isAdmin ? 'Track marketplace orders and update fulfillment.' : 'Track your recent purchases.'}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <ClockIcon className="w-4 h-4" />
          {orders.length} orders
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400">
          No orders yet.
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${statusBadge(order.status)}`}>
                      {order.status}
                    </span>
                    <span className="text-xs text-gray-400">
                      {order.createdAt ? new Date(order.createdAt).toLocaleString() : '—'}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-[#0B1E3F]">
                    Order {order.id}
                  </div>
                  <div className="text-xs text-gray-500">
                    {order.items.length} item(s) • ₦{order.totalAmount.toLocaleString()}
                  </div>
                </div>

                <div className="flex flex-col md:items-end gap-2">
                  {isAdmin ? (
                    <div className="flex items-center gap-2">
                      <TruckIcon className="w-4 h-4 text-gray-400" />
                      <select
                        value={order.status}
                        disabled={updatingId === order.id}
                        onChange={(e) => handleAdminStatusUpdate(order, e.target.value as OrderStatus)}
                        className="text-xs font-bold border border-gray-200 rounded-lg px-3 py-2 bg-white"
                      >
                        {nextStatusOptions(order.status).map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-green-600">
                      <CheckCircleIcon className="w-4 h-4" />
                      {order.payment?.status === 'paid' ? 'Payment received' : 'Awaiting payment'}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                {order.items.map((item) => (
                  <div key={`${order.id}-${item.productId}`} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                    <div className="w-12 h-12 bg-white rounded-lg overflow-hidden">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-100" />
                      )}
                    </div>
                    <div className="flex-grow">
                      <p className="text-sm font-semibold text-[#0B1E3F]">{item.name}</p>
                      <p className="text-[11px] text-gray-400">
                        Qty {item.quantity} • ₦{item.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersView;
