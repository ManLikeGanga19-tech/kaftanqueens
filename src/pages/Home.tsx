import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Truck, ShieldCheck, CreditCard, Gem } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import ProductCard from '../components/ProductCard';
import { Product } from '../types';
import { collection, getDocs, query, limit, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';

const Home = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    getDocs(query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(20)))
      .then(snap => {
        const all = snap.docs.map(d => ({ id: d.id, ...d.data() } as Product));
        setProducts(all.filter(p => p.isActive !== false).slice(0, 4));
      })
      .catch(() => setProducts([]));
  }, []);

  return (
    <div className="space-y-32 pb-32">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/hero.jpg"
            alt="Hero Kaftan"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/75 via-brand-primary/40 to-transparent" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="max-w-2xl text-brand-secondary space-y-8"
          >
            <h1 className="text-6xl md:text-8xl leading-[0.9] font-bold tracking-tighter">
              BEYOND<br />TRADITION
            </h1>
            <p className="text-lg md:text-xl uppercase tracking-[0.2em] font-medium opacity-90 max-w-lg leading-relaxed">
              Premium Kenyan Kaftans. Crafted for the modern queen with a heritage heart.
            </p>
            <div className="flex space-x-4 pt-6">
              <Link to="/shop">
                <Button className="btn-luxury h-16 px-10 text-sm uppercase tracking-widest font-bold flex items-center gap-4">
                  <Gem size={15} className="shrink-0 opacity-80" />
                  Discover the Paradise
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="aspect-[4/5] bg-brand-primary/5 p-8"
        >
          <img
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop"
            alt="Craftsmanship"
            className="w-full h-full object-cover shadow-2xl"
            referrerPolicy="no-referrer"
          />
        </motion.div>
        <div className="space-y-8">
          <h2 className="text-4xl md:text-5xl font-serif leading-tight">
            The Art of the<br /><span className="text-brand-accent italic">Kenyan Kaftan</span>
          </h2>
          <p className="text-lg text-brand-primary/70 leading-relaxed font-light">
            Each Kaftan Queen piece is more than a garment. It's a dialogue between timeless Kenyan textiles and contemporary silhouettes. We source only the finest fabrics from local artisans, ensuring every stitch tells a story of heritage and luxury.
          </p>
          <div className="grid grid-cols-2 gap-8 pt-6">
            <div className="space-y-2">
              <p className="text-3xl font-serif text-brand-accent">100%</p>
              <p className="text-xs uppercase tracking-widest font-bold opacity-60">Sustainably Sourced</p>
            </div>
            <div className="space-y-2">
              <p className="text-3xl font-serif text-brand-accent">48hr</p>
              <p className="text-xs uppercase tracking-widest font-bold opacity-60">Nairobi Delivery</p>
            </div>
          </div>
          <Button variant="outline" className="h-12 px-8 uppercase tracking-widest text-xs border-brand-primary/20">
            About Our Process
          </Button>
        </div>
      </section>

      {/* Trending Section */}
      <section className="container mx-auto px-4 space-y-12">
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] font-bold text-brand-maroon">Bestsellers</p>
            <h2 className="text-4xl font-serif">Now Trending</h2>
          </div>
          <Link to="/shop" className="group flex items-center space-x-2 text-sm uppercase tracking-widest font-bold">
            <span>View All</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
          {products.length === 0 && Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse space-y-4">
              <div className="aspect-[3/4] bg-brand-primary/5" />
              <div className="h-4 bg-brand-primary/5 rounded w-3/4" />
              <div className="h-3 bg-brand-primary/5 rounded w-1/2" />
            </div>
          ))}
        </div>
      </section>

      {/* Features Banner */}
      <section className="bg-brand-primary text-brand-secondary py-24">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 text-center md:text-left">
          <div className="space-y-4">
            <Truck className="h-8 w-8 text-brand-accent mx-auto md:mx-0" />
            <h3 className="font-serif text-xl">Quick Delivery</h3>
            <p className="text-xs opacity-60 uppercase tracking-widest leading-loose">Same-day delivery in Nairobi, 48hrs countrywide.</p>
          </div>
          <div className="space-y-4">
            <CreditCard className="h-8 w-8 text-brand-accent mx-auto md:mx-0" />
            <h3 className="font-serif text-xl">Secure M-Pesa</h3>
            <p className="text-xs opacity-60 uppercase tracking-widest leading-loose">Seamless STK Push integration for a secure checkout.</p>
          </div>
          <div className="space-y-4">
            <ShieldCheck className="h-8 w-8 text-brand-accent mx-auto md:mx-0" />
            <h3 className="font-serif text-xl">Authentic Quality</h3>
            <p className="text-xs opacity-60 uppercase tracking-widest leading-loose">Double-checked craftsmanship with a 7-day return policy.</p>
          </div>
          <div className="space-y-4">
            <Star className="h-8 w-8 text-brand-accent mx-auto md:mx-0" />
            <h3 className="font-serif text-xl">Loyalty Rewards</h3>
            <p className="text-xs opacity-60 uppercase tracking-widest leading-loose">Exclusive offers and points for our queen community.</p>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="container mx-auto px-4">
        <div className="bg-brand-maroon/5 border border-brand-maroon/20 p-12 md:p-24 text-center space-y-8 flex flex-col items-center">
          <h2 className="text-4xl md:text-5xl font-serif italic">Join the Registry</h2>
          <p className="text-sm md:text-base opacity-70 uppercase tracking-widest max-w-xl">
            Subscribe for early access to the "Monsoon Collection" and receive 10% off your first order.
          </p>
          <div className="w-full max-w-md flex flex-col md:flex-row gap-4">
            <input
              type="email"
              placeholder="Your Email Address"
              className="flex-1 bg-transparent border-b border-brand-primary/20 py-3 text-sm focus:outline-none focus:border-brand-maroon transition-colors tracking-widest uppercase"
            />
            <Button className="btn-maroon px-12 font-bold text-xs h-12">JOIN</Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
