import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Order, OrderStatus, Product } from '@/types';
import { DollarSign, ShoppingBag, Package, AlertTriangle, DatabaseZap } from 'lucide-react';
import { seedFirestore } from '@/lib/seed';
import { toast } from 'sonner';

const statusColors: Record<string, string> = {
  pending:    'bg-yellow-50 text-yellow-700 border-yellow-200',
  paid:       'bg-blue-50 text-blue-700 border-blue-200',
  processing: 'bg-purple-50 text-purple-700 border-purple-200',
  shipped:    'bg-brand-accent/10 text-brand-accent border-brand-accent/30',
  delivered:  'bg-green-50 text-green-700 border-green-200',
};

const Loader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="space-y-4 text-center">
      <div className="w-10 h-10 border-2 border-brand-primary/20 border-t-brand-accent animate-spin mx-auto" />
      <p className="text-[10px] uppercase tracking-widest font-bold text-brand-primary/40">Loading</p>
    </div>
  </div>
);

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState({
    revenue: 0,
    totalOrders: 0,
    activeProducts: 0,
    lowStock: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Recent orders
        const ordersSnap = await getDocs(
          query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(10))
        );
        const orderList = ordersSnap.docs.map(d => ({ id: d.id, ...d.data() } as Order));
        setOrders(orderList);

        // Revenue from paid/processing/shipped/delivered orders
        const paidStatuses: OrderStatus[] = [
          OrderStatus.PAID,
          OrderStatus.PROCESSING,
          OrderStatus.SHIPPED,
          OrderStatus.DELIVERED,
        ];
        const revenue = orderList
          .filter(o => paidStatuses.includes(o.status))
          .reduce((acc, o) => acc + o.total, 0);

        // All products
        const productsSnap = await getDocs(collection(db, 'products'));
        const allProducts = productsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Product));

        const activeProducts = allProducts.filter(p => p.isActive);
        const lowStock = allProducts.filter(p => p.stock < 5 && p.isActive);

        setLowStockProducts(lowStock);
        setStats({
          revenue,
          totalOrders: orderList.length,
          activeProducts: activeProducts.length,
          lowStock: lowStock.length,
        });
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <Loader />;

  const statCards = [
    {
      label: 'Total Revenue',
      value: `KES ${stats.revenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingBag,
      color: 'text-brand-accent',
      bg: 'bg-brand-accent/10',
    },
    {
      label: 'Active Products',
      value: stats.activeProducts,
      icon: Package,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Low Stock',
      value: stats.lowStock,
      icon: AlertTriangle,
      color: 'text-brand-maroon',
      bg: 'bg-brand-maroon/10',
    },
  ];

  return (
    <div className="p-6 md:p-10 space-y-10">
      {/* Header */}
      <div className="border-b border-brand-primary/10 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif tracking-tight">Dashboard</h1>
          <p className="text-[10px] uppercase tracking-widest font-bold text-brand-primary/40 mt-1">
            Overview &amp; Insights
          </p>
        </div>
        <button
          onClick={async () => {
            setSeeding(true);
            try {
              const result = await seedFirestore();
              toast.success('Seed complete', { description: result });
            } catch {
              toast.error('Seed failed. Check console.');
            } finally {
              setSeeding(false);
            }
          }}
          disabled={seeding}
          className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold h-9 px-4 border border-brand-primary/20 hover:bg-brand-primary hover:text-brand-secondary transition-colors disabled:opacity-50"
        >
          <DatabaseZap size={14} />
          {seeding ? 'Seeding...' : 'Seed Data'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div
            key={label}
            className="border border-brand-primary/10 p-6 space-y-4"
          >
            <div className={`w-10 h-10 flex items-center justify-center ${bg}`}>
              <Icon size={18} className={color} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-brand-primary/40">
                {label}
              </p>
              <p className="text-2xl font-serif mt-1">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        {/* Recent Orders */}
        <div className="xl:col-span-2 space-y-4">
          <h2 className="text-lg font-serif uppercase tracking-widest border-b border-brand-primary/10 pb-4">
            Recent Orders
          </h2>
          <div className="overflow-x-auto border border-brand-primary/10">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-brand-primary text-brand-secondary text-[9px] uppercase tracking-[0.2em] font-bold">
                  <th className="px-5 py-3">Tracking</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Total</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="text-[10px] uppercase tracking-widest font-bold">
                {orders.map(order => (
                  <tr
                    key={order.id}
                    className="border-b border-brand-primary/5 hover:bg-brand-secondary/50 transition-colors"
                  >
                    <td className="px-5 py-3 font-mono text-[9px] text-brand-primary/60">
                      {order.trackingNumber || '—'}
                    </td>
                    <td className="px-5 py-3">{order.address.fullName}</td>
                    <td className="px-5 py-3">KES {order.total.toLocaleString()}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-block border px-2 py-0.5 text-[8px] uppercase tracking-widest font-bold ${
                          statusColors[order.status] ?? 'bg-gray-50 text-gray-600 border-gray-200'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-brand-primary/40">
                      {order.createdAt?.toDate
                        ? order.createdAt.toDate().toLocaleDateString('en-KE')
                        : '—'}
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center py-16 font-serif text-lg opacity-30 italic"
                    >
                      No orders yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="space-y-4">
          <h2 className="text-lg font-serif uppercase tracking-widest border-b border-brand-primary/10 pb-4">
            Low Stock Alerts
          </h2>
          <div className="space-y-3">
            {lowStockProducts.map(product => (
              <div
                key={product.id}
                className="border border-brand-maroon/20 bg-brand-maroon/5 p-4 flex items-center gap-4"
              >
                {product.images?.[0] && (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-10 aspect-[3/4] object-cover grayscale shrink-0"
                    referrerPolicy="no-referrer"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest truncate">
                    {product.name}
                  </p>
                  <p className="text-[10px] text-brand-maroon font-bold uppercase tracking-widest mt-0.5">
                    {product.stock} unit{product.stock !== 1 ? 's' : ''} remaining
                  </p>
                </div>
                <Link
                  to={`/admin/products/${product.id}`}
                  className="text-[9px] uppercase tracking-widest font-bold text-brand-accent hover:text-brand-primary transition-colors shrink-0"
                >
                  Edit
                </Link>
              </div>
            ))}
            {lowStockProducts.length === 0 && (
              <p className="text-[10px] uppercase tracking-widest font-bold text-brand-primary/30 py-8 text-center">
                All products well-stocked
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
