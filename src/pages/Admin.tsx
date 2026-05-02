import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Users, AlertTriangle, TrendingUp, DollarSign, Package, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { collection, query, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Order, Product } from '../types';

const AdminLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="space-y-4 text-center">
      <div className="w-10 h-10 border-2 border-brand-primary/20 border-t-brand-accent animate-spin mx-auto" />
      <p className="text-[10px] uppercase tracking-widest font-bold text-brand-primary/40">Loading</p>
    </div>
  </div>
);

const Admin = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({
    revenue: 0,
    sales: 0,
    customers: 0,
    lowStock: 0
  });

  useEffect(() => {
    // Only redirect once both auth and profile have resolved
    if (!authLoading && profile !== null && profile.role !== 'admin') {
      navigate('/');
    }
    if (!authLoading && !user) {
      navigate('/');
    }
  }, [profile, authLoading, user]);

  useEffect(() => {
    if (!profile || profile.role !== 'admin') return;
    const fetchAdminData = async () => {
      try {
        const orderSnap = await getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(10)));
        const orderList = orderSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
        setOrders(orderList);

        const totalRevenue = orderList.reduce((acc, curr) => acc + curr.total, 0);
        setStats({
          revenue: totalRevenue,
          sales: orderList.length,
          customers: 42, // Mock
          lowStock: 2 // Mock
        });
      } catch (error) {
        console.error("Admin fetch error:", error);
      }
    };
    fetchAdminData();
  }, [profile]);

  // Show loading while auth resolves OR while profile is still syncing for a logged-in user
  if (authLoading || (user && !profile)) return <AdminLoader />;

  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto px-4 py-12 space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-brand-primary/10 pb-8 gap-4">
          <div className="space-y-4">
            <h1 className="text-4xl font-serif tracking-tight">Admin Emporium</h1>
            <p className="text-[10px] uppercase font-bold tracking-[0.3em] opacity-40">Governance & Commerce Oversight</p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" className="rounded-none border-brand-primary/10 uppercase text-[10px] font-bold tracking-widest h-12">Export Report</Button>
            <Button className="btn-luxury h-12 uppercase text-[10px] font-bold tracking-widest px-8">New Product</Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { label: 'Revenue (Weekly)', value: `Kes ${stats.revenue.toLocaleString()}`, icon: DollarSign, color: 'text-green-600' },
            { label: 'Units Sold', value: stats.sales, icon: ShoppingBag, color: 'text-brand-accent' },
            { label: 'Active Queens', value: stats.customers, icon: Users, color: 'text-blue-500' },
            { label: 'Low Stock Alerts', value: stats.lowStock, icon: AlertTriangle, color: 'text-brand-maroon' },
          ].map((item, i) => (
            <Card key={i} className="rounded-none border-brand-primary/10 bg-brand-secondary/50 shadow-none">
              <CardContent className="pt-8 space-y-4">
                <div className="flex justify-between items-start">
                  <div className={`p-3 rounded-none ${item.color} bg-white border border-current opacity-20`}>
                    <item.icon size={20} />
                  </div>
                  <Badge variant="outline" className="border-green-500/20 text-green-600 text-[8px] tracking-widest uppercase">+12%</Badge>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-40 mb-1">{item.label}</p>
                  <p className="text-3xl font-serif">{item.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Latest Orders */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xl font-serif uppercase tracking-widest border-b border-brand-primary/10 pb-4">Recent Transactions</h3>
            <div className="bg-white border border-brand-primary/10">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-brand-primary/10 text-[9px] uppercase tracking-[0.2em] font-bold opacity-40">
                    <th className="px-6 py-4">Reference</th>
                    <th className="px-6 py-4">Client</th>
                    <th className="px-6 py-4">Value</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Action</th>
                  </tr>
                </thead>
                <tbody className="text-[10px] uppercase tracking-widest font-bold">
                  {orders.map(order => (
                    <tr key={order.id} className="border-b border-brand-primary/5 hover:bg-brand-primary/5 transition-all">
                      <td className="px-6 py-4">{order.trackingNumber}</td>
                      <td className="px-6 py-4">{order.address.fullName.split(' ')[0]}</td>
                      <td className="px-6 py-4">Kes {order.total.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="border-brand-accent/30 text-brand-accent rounded-none uppercase text-[8px] tracking-widest">{order.status}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-brand-primary/40 hover:text-brand-primary">
                          <ExternalLink size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-20 opacity-30 italic font-serif text-lg">No movements detected</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Low Stock Panel */}
          <div className="space-y-6">
            <h3 className="text-xl font-serif uppercase tracking-widest border-b border-brand-primary/10 pb-4">Inventory Alerts</h3>
            <div className="space-y-4">
              {[
                { name: 'Luxury Zari Silk Dera', stock: 3, image: 'https://images.unsplash.com/photo-1620331311520-246422fd82f9?q=80&w=200' },
                { name: 'Royal Emerald Velvet Kaftan', stock: 2, image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=200' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-brand-maroon/5 border border-brand-maroon/15">
                  <div className="flex items-center gap-4">
                    <img src={item.image} className="w-12 aspect-[3/4] object-cover grayscale" referrerPolicy="no-referrer" />
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-widest">{item.name}</h4>
                      <p className="text-[10px] text-brand-maroon font-bold uppercase mt-1 tracking-widest">{item.stock} Units Remaining</p>
                    </div>
                  </div>
                  <Button variant="link" className="text-brand-maroon h-fit p-0 uppercase text-[8px] font-black tracking-tighter hover:text-brand-accent">REPLENISH</Button>
                </div>
              ))}
            </div>
            
            <Card className="rounded-none border-brand-primary/10 bg-brand-primary text-brand-secondary shadow-none">
              <CardHeader>
                <CardTitle className="text-sm font-serif uppercase tracking-[0.2em] flex items-center gap-2">
                  <TrendingUp size={16} className="text-brand-accent" />
                  Growth Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[10px] opacity-60 uppercase tracking-widest leading-loose">
                  Traditional Kaftans are seeing a <span className="text-brand-accent">24% spike</span> in demand since Monday. Consider highlighting these in the next newsletter.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
