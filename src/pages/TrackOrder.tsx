import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Package, Truck, CheckCircle2, Clock, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '../contexts/AuthContext';
import Breadcrumbs from '../components/Breadcrumbs';
import { toast } from 'sonner';

const STATUS_STEPS = [
  { key: 'pending',    icon: Clock,        label: 'Order Placed',   desc: 'Your order has been received and confirmed.' },
  { key: 'processing', icon: Package,       label: 'Processing',     desc: 'Our artisans are carefully preparing your order.' },
  { key: 'shipped',    icon: Truck,         label: 'Out for Delivery',desc: 'Your kaftan is on its way to you.' },
  { key: 'delivered',  icon: CheckCircle2,  label: 'Delivered',      desc: 'Your order has arrived. Enjoy your piece!' },
];

const TrackOrder = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trackingInput, setTrackingInput] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (!trackingInput.trim()) {
      toast.error('Please enter a tracking number.');
      return;
    }
    // In production, this would query Firestore for the order
    setSearched(true);
    toast.info('Live tracking coming soon. Sign in to view your orders.');
  };

  return (
    <div className="container mx-auto px-4 py-16 pb-32 max-w-2xl">
      <Breadcrumbs items={[{ label: 'Track Order' }]} />

      <div className="mt-10 space-y-4">
        <p className="text-xs uppercase tracking-[0.3em] font-bold text-brand-maroon">Order Status</p>
        <h1 className="text-5xl font-serif">Track Your<br />Collection</h1>
        <p className="text-brand-primary/55 uppercase text-[10px] tracking-widest font-medium max-w-md">
          Enter your order reference number below or sign in to view all your orders in one place.
        </p>
      </div>

      {/* Search form */}
      <form onSubmit={handleSearch} className="mt-12 space-y-4">
        <label className="text-[10px] uppercase font-bold tracking-widest opacity-60">Order Reference Number</label>
        <div className="flex gap-3">
          <Input
            value={trackingInput}
            onChange={e => setTrackingInput(e.target.value)}
            placeholder="e.g. KQ-482910"
            className="flex-1 h-14 rounded-none border-brand-primary/15 uppercase text-[11px] tracking-widest focus-visible:ring-brand-accent"
          />
          <Button type="submit" className="btn-luxury h-14 px-8 uppercase tracking-widest text-xs font-bold flex items-center gap-2">
            <Search size={16} />
            Track
          </Button>
        </div>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-4 my-10">
        <div className="flex-1 h-px bg-brand-primary/10" />
        <span className="text-[9px] uppercase tracking-[0.3em] font-bold text-brand-primary/30">or</span>
        <div className="flex-1 h-px bg-brand-primary/10" />
      </div>

      {/* Sign in prompt / My Orders link */}
      {user ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-brand-primary/10 p-8 space-y-4"
        >
          <p className="text-sm font-serif">View all your orders in My Account</p>
          <p className="text-[10px] uppercase tracking-widest font-bold text-brand-primary/40">
            Track every order, see delivery status, and manage returns — all in one place.
          </p>
          <Button
            onClick={() => navigate('/profile?tab=orders')}
            className="btn-luxury h-12 px-8 uppercase tracking-widest text-xs font-bold flex items-center gap-2"
          >
            My Orders
            <ArrowRight size={14} />
          </Button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-brand-primary text-brand-secondary p-8 space-y-4"
        >
          <p className="text-sm font-serif">Sign in for full order tracking</p>
          <p className="text-[10px] uppercase tracking-widest font-bold opacity-40 leading-relaxed">
            Sign in to see all your past and current orders, real-time delivery updates, and easy returns — all in one royal dashboard.
          </p>
          <Link to="/login" state={{ from: '/track' }}>
            <Button className="bg-brand-secondary text-brand-primary hover:bg-brand-accent transition-colors h-12 px-8 uppercase tracking-widest text-xs font-bold mt-2">
              Sign In to Track Orders
            </Button>
          </Link>
        </motion.div>
      )}

      {/* Order status key */}
      <section className="mt-16 space-y-6">
        <h2 className="text-[10px] uppercase tracking-[0.3em] font-bold text-brand-primary/40">Order Status Guide</h2>
        <div className="space-y-0">
          {STATUS_STEPS.map(({ icon: Icon, label, desc }, i) => (
            <div key={label} className="flex items-start gap-5 py-5 border-b border-brand-primary/5 last:border-none">
              <div className="w-8 h-8 bg-brand-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                <Icon size={16} className="text-brand-accent" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-widest">{label}</p>
                <p className="text-sm text-brand-primary/55 font-light">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default TrackOrder;
