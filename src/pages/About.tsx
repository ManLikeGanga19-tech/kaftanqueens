import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Breadcrumbs from '../components/Breadcrumbs';

const PILLARS = [
  {
    title: 'Heritage First',
    description: 'Every design draws from centuries of East African textile tradition — from Swahili coastal weaves to inland embroidery techniques passed down through generations.',
  },
  {
    title: 'Ethical Sourcing',
    description: 'We partner exclusively with Kenyan artisans and cooperatives. Every fabric, thread, and embellishment is sourced locally, supporting over 40 families across Nairobi and the Coast.',
  },
  {
    title: 'Modern Royalty',
    description: 'Our silhouettes are designed for the contemporary Kenyan woman — effortlessly elegant, culturally rooted, and perfectly suited for every occasion from the boardroom to the gala.',
  },
];

const STATS = [
  { value: '40+', label: 'Artisan Families Supported' },
  { value: '100%', label: 'Locally Sourced Fabrics' },
  { value: '2019', label: 'Founded in Nairobi' },
  { value: '48hr', label: 'Nairobi Delivery' },
];

const About = () => {
  return (
    <div className="pb-32">
      <div className="container mx-auto px-4 pt-12">
        <Breadcrumbs items={[{ label: 'About Us' }]} />
      </div>

      {/* Hero */}
      <section className="relative h-[60vh] flex items-end overflow-hidden mt-8">
        <img
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1920&auto=format&fit=crop"
          alt="Kaftan Queens Story"
          className="absolute inset-0 w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-primary/90 via-brand-primary/30 to-transparent" />
        <div className="relative z-10 container mx-auto px-4 pb-16 text-brand-secondary space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] font-bold text-brand-accent">Our Story</p>
          <h1 className="text-5xl md:text-7xl font-serif leading-tight">Crafted for<br />the Queen in You</h1>
        </div>
      </section>

      {/* Mission */}
      <section className="container mx-auto px-4 py-24 grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          <p className="text-xs uppercase tracking-[0.3em] font-bold text-brand-maroon">The Mission</p>
          <h2 className="text-4xl md:text-5xl font-serif leading-tight">
            Where Kenyan Heritage<br />Meets Contemporary Luxury
          </h2>
          <p className="text-brand-primary/70 leading-relaxed text-base font-light max-w-lg">
            Kaftan Queens was born from a single belief: that African women deserve fashion that celebrates their roots without sacrificing modernity. We bridge the gap between traditional Kenyan craftsmanship and the global luxury market, one kaftan at a time.
          </p>
          <p className="text-brand-primary/70 leading-relaxed text-base font-light max-w-lg">
            Founded in Nairobi in 2019, every piece in our collection is a love letter to the women who carry heritage in their hearts and ambition in their stride.
          </p>
          <Link to="/shop">
            <Button className="btn-luxury h-14 px-10 uppercase tracking-widest text-xs font-bold flex items-center gap-3">
              Explore the Collection
              <ArrowRight size={16} />
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="aspect-[4/5] overflow-hidden"
        >
          <img
            src="https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=800&auto=format&fit=crop"
            alt="Artisan craftsmanship"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </motion.div>
      </section>

      {/* Stats */}
      <section className="bg-brand-primary text-brand-secondary py-20">
        <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          {STATS.map(({ value, label }) => (
            <div key={label} className="space-y-3">
              <p className="text-4xl md:text-5xl font-serif text-brand-accent">{value}</p>
              <p className="text-[9px] uppercase tracking-[0.25em] font-bold opacity-50">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pillars */}
      <section className="container mx-auto px-4 py-24 space-y-16">
        <div className="text-center space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] font-bold text-brand-maroon">What We Stand For</p>
          <h2 className="text-4xl font-serif">Our Three Pillars</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {PILLARS.map(({ title, description }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="space-y-5 border-t-2 border-brand-accent pt-8"
            >
              <p className="text-[9px] uppercase tracking-[0.3em] font-bold text-brand-primary/30">0{i + 1}</p>
              <h3 className="text-2xl font-serif">{title}</h3>
              <p className="text-brand-primary/60 leading-relaxed text-sm font-light">{description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4">
        <div className="bg-brand-maroon/5 border border-brand-maroon/20 p-16 md:p-24 text-center space-y-6">
          <h2 className="text-4xl font-serif italic">Ready to Find Your Piece?</h2>
          <p className="text-sm opacity-60 uppercase tracking-widest max-w-lg mx-auto font-medium">
            Browse our full collection of traditional and modern Kenyan kaftans.
          </p>
          <Link to="/shop">
            <Button className="btn-luxury h-14 px-12 uppercase tracking-widest text-xs font-bold mt-4">
              Shop Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default About;
