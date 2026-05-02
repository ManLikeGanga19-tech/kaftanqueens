import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter, Mail, Phone, MapPin, MessageCircle } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-brand-primary text-brand-secondary pt-20 pb-10">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="space-y-6">
          <Link to="/" className="text-3xl font-serif font-bold tracking-tighter text-brand-accent">
            KAFTAN QUEENS
          </Link>
          <p className="text-sm opacity-70 leading-relaxed uppercase tracking-widest">
            Bridging tradition and modernity with premium Kenyan kaftans. Crafted for the queen in you.
          </p>
          <div className="flex space-x-4">
            <Instagram size={20} className="hover:text-brand-accent cursor-pointer transition-colors" />
            <Facebook size={20} className="hover:text-brand-accent cursor-pointer transition-colors" />
            <Twitter size={20} className="hover:text-brand-accent cursor-pointer transition-colors" />
            <MessageCircle size={20} className="hover:text-brand-accent cursor-pointer transition-colors" aria-label="WhatsApp" />
          </div>
        </div>

        <div>
          <h4 className="text-lg font-serif mb-6 text-brand-accent uppercase tracking-widest">Shop</h4>
          <ul className="space-y-4 text-sm opacity-70 uppercase tracking-widest font-medium">
            <li><Link to="/shop" className="hover:text-brand-accent transition-colors">All Collections</Link></li>
            <li><Link to="/shop?category=traditional" className="hover:text-brand-accent transition-colors">Traditional Kaftans</Link></li>
            <li><Link to="/shop?category=modern" className="hover:text-brand-accent transition-colors">Modern Designs</Link></li>
            <li><Link to="/shop?featured=true" className="hover:text-brand-accent transition-colors">Bestsellers</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-serif mb-6 text-brand-accent uppercase tracking-widest">Client Service</h4>
          <ul className="space-y-4 text-sm opacity-70 uppercase tracking-widest font-medium">
            <li><Link to="/faq" className="hover:text-brand-accent transition-colors">FAQs</Link></li>
            <li><Link to="/shipping" className="hover:text-brand-accent transition-colors">Shipping & Returns</Link></li>
            <li><Link to="/size-guide" className="hover:text-brand-accent transition-colors">Size Guide</Link></li>
            <li><Link to="/track" className="hover:text-brand-accent transition-colors">Track Order</Link></li>
          </ul>
        </div>

        <div className="space-y-4">
          <h4 className="text-lg font-serif mb-6 text-brand-accent uppercase tracking-widest">Contact Us</h4>
          <div className="flex items-start space-x-3 text-sm opacity-70 font-medium tracking-wide">
            <MapPin size={18} className="mt-1" />
            <span>Nairobi, Kenya<br />The Alchemist, Parklands</span>
          </div>
          <div className="flex items-center space-x-3 text-sm opacity-70 font-medium tracking-wide">
            <Phone size={18} />
            <span>+254 700 000 000</span>
          </div>
          <div className="flex items-center space-x-3 text-sm opacity-70 font-medium tracking-wide">
            <Mail size={18} />
            <span>hello@kaftanqueens.com</span>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 mt-20 pt-8 border-t border-brand-secondary/10 flex flex-col md:flex-row justify-between items-center text-[10px] uppercase tracking-[0.2em] opacity-40">
        <p>© 2026 KAFTAN QUEENS. ALL RIGHTS RESERVED.</p>
        <div className="flex space-x-6 mt-4 md:mt-0">
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
          <span>Payment Methods: M-Pesa, Visa, Mastercard</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
