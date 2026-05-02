import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { User, Package, Heart, Settings, LogOut, ExternalLink, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Order, OrderStatus } from '../types';
import { motion } from 'motion/react';

const Profile = () => {
  const { user, profile, logout } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const initialTab = searchParams.get('tab') || 'profile';

  useEffect(() => {
    if (user && initialTab === 'orders') {
      const fetchOrders = async () => {
        setLoadingOrders(true);
        try {
          const q = query(
            collection(db, 'orders'),
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc')
          );
          const snap = await getDocs(q);
          setOrders(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
        } catch (error) {
          console.error("Error fetching orders:", error);
        }
        setLoadingOrders(false);
      };
      fetchOrders();
    }
  }, [user, initialTab]);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-40 h-[70vh] flex flex-col items-center justify-center text-center space-y-8">
        <div className="w-20 h-20 bg-brand-primary/5 rounded-full flex items-center justify-center">
          <User size={32} className="text-brand-primary/30" />
        </div>
        <div className="space-y-4">
          <h2 className="text-4xl font-serif">Acknowledge Your Majesty</h2>
          <p className="text-[10px] uppercase tracking-widest font-bold opacity-40">Please login to access your private registry and order history.</p>
        </div>
        <Button onClick={() => navigate('/')} className="btn-luxury px-12 uppercase text-[10px] tracking-widest font-bold">Return to Palace</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-20 pb-40">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-16">
        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 space-y-12">
          <div className="flex items-center space-x-6 px-4">
            <div className="w-16 h-16 rounded-full bg-brand-accent flex items-center justify-center text-brand-primary text-xl font-bold border-2 border-brand-primary">
              {user.displayName?.[0] || 'Q'}
            </div>
            <div>
              <h3 className="font-serif text-xl leading-none">{user.displayName}</h3>
              <p className="text-[10px] uppercase font-bold tracking-widest opacity-40 mt-1">{profile?.role}</p>
            </div>
          </div>

          <nav className="space-y-2">
            <button onClick={() => navigate('/profile?tab=profile')} className={`w-full flex items-center justify-between px-4 py-3 text-[10px] uppercase tracking-widest font-bold transition-all ${initialTab === 'profile' ? 'bg-brand-primary text-brand-secondary' : 'hover:bg-brand-primary/5'}`}>
              <div className="flex items-center gap-4">
                <User size={16} />
                <span>My Profile</span>
              </div>
              <ChevronRight size={14} className="opacity-40" />
            </button>
            <button onClick={() => navigate('/profile?tab=orders')} className={`w-full flex items-center justify-between px-4 py-3 text-[10px] uppercase tracking-widest font-bold transition-all ${initialTab === 'orders' ? 'bg-brand-primary text-brand-secondary' : 'hover:bg-brand-primary/5'}`}>
              <div className="flex items-center gap-4">
                <Package size={16} />
                <span>My Orders</span>
              </div>
              <ChevronRight size={14} className="opacity-40" />
            </button>
            <button onClick={() => navigate('/profile?tab=wishlist')} className={`w-full flex items-center justify-between px-4 py-3 text-[10px] uppercase tracking-widest font-bold transition-all ${initialTab === 'wishlist' ? 'bg-brand-primary text-brand-secondary' : 'hover:bg-brand-primary/5'}`}>
              <div className="flex items-center gap-4">
                <Heart size={16} />
                <span>Wishlist</span>
              </div>
              <ChevronRight size={14} className="opacity-40" />
            </button>
            <Separator className="my-4 bg-brand-primary/10" />
            <button onClick={logout} className="w-full flex items-center gap-4 px-4 py-3 text-[10px] uppercase tracking-widest font-bold text-red-500 hover:bg-red-500/5 transition-all">
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1">
          <Tabs value={initialTab} className="w-full">
            <TabsContent value="profile" className="m-0 space-y-12">
              <h2 className="text-4xl font-serif tracking-tight">Identity & Secrets</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white border border-brand-primary/10 p-10">
                <div className="space-y-2">
                  <p className="text-[10px] uppercase font-bold tracking-widest opacity-40">Full Name</p>
                  <p className="font-serif text-lg">{user.displayName}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] uppercase font-bold tracking-widest opacity-40">Email Address</p>
                  <p className="font-serif text-lg">{user.email}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] uppercase font-bold tracking-widest opacity-40">Phone Number</p>
                  <p className="font-serif text-lg">{profile?.email || 'Not verified'}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] uppercase font-bold tracking-widest opacity-40">Membership Type</p>
                  <p className="font-serif text-lg uppercase tracking-widest text-brand-accent">Royal Sovereign</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="orders" className="m-0 space-y-12">
              <h2 className="text-4xl font-serif tracking-tight">Acquisition History</h2>
              {loadingOrders ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2].map(i => <div key={i} className="h-32 bg-brand-primary/5" />)}
                </div>
              ) : orders.length === 0 ? (
                <div className="py-20 text-center space-y-6 border border-dashed border-brand-primary/20">
                  <p className="font-serif text-xl opacity-40 italic">No acquisitions found</p>
                  <Button onClick={() => navigate('/shop')} variant="link" className="uppercase text-[10px] tracking-widest font-bold text-brand-accent">Examine the Collection</Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => (
                    <motion.div 
                      key={order.id} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white border border-brand-primary/10 p-8 flex flex-col md:flex-row justify-between gap-8 md:items-center"
                    >
                      <div className="flex gap-6 items-center">
                        <div className="w-20 aspect-square bg-gray-100 flex items-center justify-center opacity-30">
                          <Package size={32} />
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] uppercase font-bold tracking-widest opacity-40">Order ID: {order.trackingNumber}</p>
                          <h4 className="font-serif text-lg">{order.items.length} Items Purchased</h4>
                          <p className="text-[10px] uppercase tracking-widest font-bold opacity-60">Status: <span className="text-brand-accent">{order.status}</span></p>
                        </div>
                      </div>
                      
                      <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-2">
                        <span className="font-medium text-lg">Kes {order.total.toLocaleString()}</span>
                        <Button variant="outline" className="h-10 px-6 uppercase text-[10px] tracking-widest font-bold border-brand-primary/10 hover:bg-brand-primary hover:text-brand-secondary">
                          Details
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="wishlist" className="m-0 space-y-12">
              <h2 className="text-4xl font-serif tracking-tight">The Desire List</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="py-40 text-center space-y-6 border border-dashed border-brand-primary/20 col-span-full">
                  <p className="font-serif text-2xl opacity-40 italic">Coming Soon...</p>
                  <p className="text-[10px] uppercase tracking-widest font-bold opacity-30">Our artisans are curating your saved pieces</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default Profile;
