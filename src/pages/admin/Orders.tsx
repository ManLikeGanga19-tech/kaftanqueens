import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Order, OrderStatus } from '@/types';
import { toast } from 'sonner';
import { ChevronDown, ChevronUp } from 'lucide-react';

const STATUS_OPTIONS = Object.values(OrderStatus);

const statusColors: Record<string, string> = {
  pending:    'bg-yellow-50 text-yellow-700 border-yellow-200',
  paid:       'bg-blue-50 text-blue-700 border-blue-200',
  processing: 'bg-purple-50 text-purple-700 border-purple-200',
  shipped:    'bg-brand-accent/10 text-brand-accent border-brand-accent/30',
  delivered:  'bg-green-50 text-green-700 border-green-200',
};

const Loader = () => (
  <div className="min-h-[40vh] flex items-center justify-center">
    <div className="space-y-4 text-center">
      <div className="w-10 h-10 border-2 border-brand-primary/20 border-t-brand-accent animate-spin mx-auto" />
      <p className="text-[10px] uppercase tracking-widest font-bold text-brand-primary/40">Loading</p>
    </div>
  </div>
);

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc')))
      .then(snap => setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() } as Order))))
      .catch(() => toast.error('Failed to load orders.'))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (order: Order, newStatus: OrderStatus) => {
    setUpdatingId(order.id);
    try {
      await updateDoc(doc(db, 'orders', order.id), { status: newStatus });
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: newStatus } : o));
      toast.success('Order status updated.');
    } catch {
      toast.error('Failed to update status.');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="p-6 md:p-10 space-y-8">
      <div className="border-b border-brand-primary/10 pb-6">
        <h1 className="text-3xl font-serif tracking-tight">Orders</h1>
        <p className="text-[10px] uppercase tracking-widest font-bold text-brand-primary/40 mt-1">
          {orders.length} total
        </p>
      </div>

      <div className="overflow-x-auto border border-brand-primary/10">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-brand-primary text-brand-secondary text-[9px] uppercase tracking-[0.2em] font-bold">
              <th className="px-5 py-3">Tracking</th>
              <th className="px-5 py-3">Customer</th>
              <th className="px-5 py-3">Items</th>
              <th className="px-5 py-3">Total</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="text-[10px] uppercase tracking-widest font-bold">
            {orders.map(order => (
              <>
                <tr
                  key={order.id}
                  className="border-b border-brand-primary/5 hover:bg-brand-secondary/40 transition-colors cursor-pointer"
                  onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                >
                  <td className="px-5 py-3 font-mono text-[9px] text-brand-primary/60">
                    {order.trackingNumber || '—'}
                  </td>
                  <td className="px-5 py-3">{order.address.fullName}</td>
                  <td className="px-5 py-3">{order.items.length}</td>
                  <td className="px-5 py-3">KES {order.total.toLocaleString()}</td>
                  <td className="px-5 py-3" onClick={e => e.stopPropagation()}>
                    <select
                      value={order.status}
                      onChange={e => handleStatusChange(order, e.target.value as OrderStatus)}
                      disabled={updatingId === order.id}
                      className={`border text-[9px] uppercase tracking-widest font-bold px-2 py-1 rounded-none focus:outline-none bg-white disabled:opacity-50 ${statusColors[order.status] ?? ''}`}
                    >
                      {STATUS_OPTIONS.map(s => (
                        <option key={s} value={s} className="bg-white text-brand-primary normal-case">{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-3 text-brand-primary/40">
                    {order.createdAt?.toDate
                      ? order.createdAt.toDate().toLocaleDateString('en-KE')
                      : '—'}
                  </td>
                  <td className="px-5 py-3 text-brand-primary/30">
                    {expandedId === order.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </td>
                </tr>
                {expandedId === order.id && (
                  <tr key={`${order.id}-detail`} className="bg-brand-secondary/30">
                    <td colSpan={7} className="px-6 py-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <p className="text-[9px] uppercase tracking-widest font-bold text-brand-primary/40">Delivery Address</p>
                          <p className="text-sm text-brand-primary/70 normal-case font-normal leading-relaxed">
                            {order.address.fullName}<br />
                            {order.address.city}<br />
                            {order.address.details}<br />
                            {order.address.phone}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-[9px] uppercase tracking-widest font-bold text-brand-primary/40">Items</p>
                          <div className="space-y-1">
                            {order.items.map((item, i) => (
                              <div key={i} className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                                <span className="text-brand-primary/60">{item.quantity}× {item.name} ({item.size}, {item.color})</span>
                                <span>KES {(item.price * item.quantity).toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-16 font-serif text-lg opacity-30 italic">
                  No orders yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
