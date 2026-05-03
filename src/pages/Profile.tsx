import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { User, Package, Heart, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useWishlist } from '../contexts/WishlistContext';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { collection, query, where, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Order, Product } from '../types';
import { motion } from 'motion/react';
import ProductCard from '../components/ProductCard';

const Profile = () => {
  const { user, profile, logout } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { wishlist, loading: wishlistLoading } = useWishlist();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [loadingWishlistProducts, setLoadingWishlistProducts] = useState(false);

  const activeTab = searchParams.get('tab') || 'profile';

  useEffect(() => {
    if (!user || activeTab !== 'orders') return;
    setLoadingOrders(true);
    getDocs(query(
      collection(db, 'orders'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    ))
      .then(snap => setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() } as Order))))
      .catch(() => setOrders([]))
      .finally(() => setLoadingOrders(false));
  }, [user, activeTab]);

  useEffect(() => {
    if (activeTab !== 'wishlist' || wishlist.length === 0) {
      if (activeTab === 'wishlist') setWishlistProducts([]);
      return;
    }
    setLoadingWishlistProducts(true);
    Promise.all(wishlist.map(id => getDoc(doc(db, 'products', id))))
      .then(snaps => setWishlistProducts(
        snaps.filter(s => s.exists()).map(s => ({ id: s.id, ...s.data() } as Product))
      ))
      .catch(() => setWishlistProducts([]))
      .finally(() => setLoadingWishlistProducts(false));
  }, [wishlist, activeTab]);

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
            {[
              { tab: 'profile', icon: User, label: 'My Profile' },
              { tab: 'orders', icon: Package, label: 'My Orders' },
              { tab: 'wishlist', icon: Heart, label: 'Wishlist' },
            ].map(({ tab, icon: Icon, label }) => (
              <button
                key={tab}
                onClick={() => navigate(`/profile?tab=${tab}`)}
                className={`w-full flex items-center justify-between px-4 py-3 text-[10px] uppercase tracking-widest font-bold transition-all ${activeTab === tab ? 'bg-brand-primary text-brand-secondary' : 'hover:bg-brand-primary/5'}`}
              >
                <div className="flex items-center gap-4">
                  <Icon size={16} />
                  <span>{label}</span>
                </div>
                <ChevronRight size={14} className="opacity-40" />
              </button>
            ))}
            <Separator className="my-4 bg-brand-primary/10" />
            <button onClick={logout} className="w-full flex items-center gap-4 px-4 py-3 text-[10px] uppercase tracking-widest font-bold text-red-500 hover:bg-red-500/5 transition-all">
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1">
          <Tabs value={activeTab} className="w-full">
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
                  {orders.map(order => (
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
                        <Button variant="outline" className="h-10 px-6 uppercase text-[10px] tracking-widest font-bold border-brand-primary/10 hover:bg-brand-primary hover:text-brand-secondary">Details</Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="wishlist" className="m-0 space-y-12">
              <h2 className="text-4xl font-serif tracking-tight">The Desire List</h2>
              {wishlistLoading || loadingWishlistProducts ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  {[1, 2].map(i => (
                    <div key={i} className="animate-pulse space-y-4">
                      <div className="aspect-[3/4] bg-brand-primary/5" />
                      <div className="h-4 bg-brand-primary/5 rounded w-3/4" />
                    </div>
                  ))}
                </div>
              ) : wishlistProducts.length === 0 ? (
                <div className="py-40 text-center space-y-6 border border-dashed border-brand-primary/20">
                  <Heart size={48} className="mx-auto text-brand-primary/20" />
                  <p className="font-serif text-2xl opacity-40 italic">Your desire list is empty</p>
                  <p className="text-[10px] uppercase tracking-widest font-bold opacity-30">Heart a piece on any product page to save it here</p>
                  <Button onClick={() => navigate('/shop')} variant="link" className="uppercase text-[10px] tracking-widest font-bold text-brand-accent">Explore the Collection</Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {wishlistProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default Profile;
