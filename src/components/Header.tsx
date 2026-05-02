import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, User, Search, Menu, X, Package, Star, Zap, LogOut, LayoutDashboard, ClipboardList } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { AnimatePresence, motion } from 'motion/react';
import { toast } from 'sonner';
import { showWelcomeToast } from '../lib/toasts';

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" aria-hidden="true">
    <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const MEMBER_BENEFITS = [
  { icon: Package, label: 'Track orders in real-time' },
  { icon: Heart,   label: 'Save pieces to your wishlist' },
  { icon: Star,    label: 'Earn loyalty rewards' },
  { icon: Zap,     label: 'Faster checkout every time' },
];

const Header = () => {
  const { user, profile, loading: authLoading, logout, loginWithGoogle, loginWithFacebook } = useAuth();
  const { items } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const handleGoogleSignIn = async () => {
    try {
      const signedInUser = await loginWithGoogle();
      showWelcomeToast(signedInUser.displayName);
    } catch {
      toast.error('Sign-in failed. Please try again.');
    }
  };

  const handleFacebookSignIn = async () => {
    try {
      const signedInUser = await loginWithFacebook();
      showWelcomeToast(signedInUser.displayName);
    } catch {
      toast.error('Sign-in failed. Please try again.');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
    toast.success('You have been signed out.');
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Announcement Bar */}
      <div className="bg-brand-maroon text-brand-secondary text-[9px] uppercase tracking-[0.25em] font-bold py-2.5 text-center px-4">
        <span className="hidden sm:inline">Free Nairobi Delivery on Orders Over Kes 5,000&nbsp;&nbsp;·&nbsp;&nbsp;</span>
        Secure M-Pesa Checkout&nbsp;&nbsp;·&nbsp;&nbsp;7-Day Returns Guaranteed
      </div>

      <div className="w-full bg-brand-secondary/90 backdrop-blur-md border-b border-brand-primary/10">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="text-2xl md:text-3xl font-serif font-bold tracking-tighter hover:text-brand-accent transition-colors">
            KAFTAN QUEENS
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium uppercase tracking-widest">
            <Link to="/shop" className="hover:text-brand-accent transition-colors">Shop</Link>
            <Link to="/shop?category=traditional" className="hover:text-brand-accent transition-colors">Traditional</Link>
            <Link to="/shop?category=modern" className="hover:text-brand-accent transition-colors">Modern</Link>
            <Link to="/about" className="hover:text-brand-accent transition-colors">About</Link>
          </nav>

          {/* Icons */}
          <div className="flex items-center space-x-2 md:space-x-5">
            <button
              className={`p-2 transition-colors ${isSearchOpen ? 'text-brand-accent' : 'hover:text-brand-accent'}`}
              aria-label="Search"
              onClick={() => { setIsSearchOpen(v => !v); setSearchQuery(''); }}
            >
              <Search size={22} />
            </button>

            <Link to="/profile?tab=wishlist" className="p-2 hover:text-brand-accent transition-colors relative" aria-label="Wishlist">
              <Heart size={22} />
            </Link>

            <Link to="/cart" className="p-2 hover:text-brand-accent transition-colors relative" aria-label="Cart">
              <ShoppingBag size={22} />
              {cartCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-brand-accent text-brand-primary hover:bg-brand-accent rounded-none">
                  {cartCount}
                </Badge>
              )}
            </Link>

            {/* Account Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger
                className="p-2 hover:text-brand-accent transition-colors cursor-pointer"
                aria-label="User Account"
                disabled={authLoading}
              >
                {authLoading ? (
                  <div className="w-[22px] h-[22px] rounded-full bg-brand-primary/10 animate-pulse" />
                ) : (
                  <User size={22} />
                )}
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="p-0 bg-brand-secondary border-brand-primary/15 ring-0 shadow-2xl"
                style={{ width: user ? '240px' : '280px' }}
              >
                {user ? (
                  /* ── Authenticated ─────────────────────── */
                  <>
                    {/* Profile header — dark with gold initial */}
                    <div className="bg-brand-primary px-5 py-4 border-b border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-brand-accent flex items-center justify-center text-brand-primary font-bold font-serif text-sm shrink-0">
                          {(profile?.name || user.displayName || 'Q').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-serif text-brand-secondary font-semibold truncate leading-tight">
                            {profile?.name || user.displayName || 'My Account'}
                          </p>
                          <p className="text-[9px] uppercase tracking-widest font-bold text-brand-secondary/40 truncate">
                            {user.email}
                          </p>
                          {profile?.role === 'admin' && (
                            <span className="inline-block mt-1.5 text-[8px] uppercase tracking-widest font-bold bg-brand-maroon text-brand-secondary px-2 py-0.5">
                              Admin
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="p-1">
                      <DropdownMenuItem onClick={() => navigate('/profile')} className="gap-3 py-2.5 px-4 text-[10px] uppercase tracking-widest font-bold focus:bg-brand-accent/10 focus:text-brand-primary">
                        <User size={14} className="text-brand-accent" />
                        My Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/profile?tab=orders')} className="gap-3 py-2.5 px-4 text-[10px] uppercase tracking-widest font-bold focus:bg-brand-accent/10 focus:text-brand-primary">
                        <ClipboardList size={14} className="text-brand-accent" />
                        My Orders
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/profile?tab=wishlist')} className="gap-3 py-2.5 px-4 text-[10px] uppercase tracking-widest font-bold focus:bg-brand-accent/10 focus:text-brand-primary">
                        <Heart size={14} className="text-brand-accent" />
                        My Wishlist
                      </DropdownMenuItem>

                      <DropdownMenuSeparator className="bg-brand-primary/10 my-1" />
                      <DropdownMenuItem onClick={() => navigate('/admin')} className="gap-3 py-2.5 px-4 text-[10px] uppercase tracking-widest font-bold text-brand-maroon focus:bg-brand-maroon/10 focus:text-brand-maroon">
                        <LayoutDashboard size={14} className="text-brand-maroon" />
                        Admin Dashboard
                      </DropdownMenuItem>
                    </div>

                    <div className="border-t border-brand-primary/10 p-1">
                      <DropdownMenuItem onClick={handleLogout} className="gap-3 py-2.5 px-4 text-[10px] uppercase tracking-widest font-bold text-brand-primary/40 focus:bg-red-50 focus:text-red-500">
                        <LogOut size={14} />
                        Sign Out
                      </DropdownMenuItem>
                    </div>
                  </>
                ) : (
                  /* ── Unauthenticated ───────────────────── */
                  <>
                    {/* Welcome header */}
                    <div className="px-5 pt-5 pb-4 border-b border-brand-primary/10 space-y-1">
                      <p className="font-serif text-base tracking-tight">Welcome, Queen</p>
                      <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-brand-primary/40">
                        Sign in to unlock your full experience
                      </p>
                    </div>

                    {/* Sign-in buttons */}
                    <div className="p-3 space-y-2">
                      <button
                        onClick={handleGoogleSignIn}
                        className="w-full h-10 flex items-center gap-3 px-4 border border-brand-primary/15 bg-white hover:bg-brand-primary/5 hover:border-brand-primary/30 transition-all text-[10px] uppercase tracking-widest font-bold"
                      >
                        <GoogleIcon />
                        <span>Continue with Google</span>
                      </button>
                      <button
                        onClick={handleFacebookSignIn}
                        className="w-full h-10 flex items-center gap-3 px-4 border border-brand-primary/15 bg-white hover:bg-brand-primary/5 hover:border-brand-primary/30 transition-all text-[10px] uppercase tracking-widest font-bold"
                      >
                        <FacebookIcon />
                        <span>Continue with Facebook</span>
                      </button>
                      <button
                        onClick={() => navigate('/login')}
                        className="w-full h-10 flex items-center justify-center bg-brand-primary text-brand-secondary hover:bg-brand-maroon transition-colors text-[10px] uppercase tracking-widest font-bold"
                      >
                        View All Sign-in Options
                      </button>
                    </div>

                    {/* Benefits */}
                    <div className="px-5 pb-5 pt-3 border-t border-brand-primary/10 space-y-3">
                      <p className="text-[9px] uppercase tracking-[0.25em] font-bold text-brand-primary/30">Member Benefits</p>
                      <ul className="space-y-2">
                        {MEMBER_BENEFITS.map(({ icon: Icon, label }) => (
                          <li key={label} className="flex items-center gap-3 text-[10px] text-brand-primary/55 font-medium uppercase tracking-wide">
                            <Icon size={12} className="text-brand-accent shrink-0" />
                            {label}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <button
              className="md:hidden p-2 hover:text-brand-accent transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>

        {/* Search overlay */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="overflow-hidden border-t border-brand-primary/10 bg-brand-secondary"
            >
              <form onSubmit={handleSearch} className="container mx-auto px-4 py-4 flex items-center gap-4">
                <Search size={16} className="text-brand-primary/30 shrink-0" />
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Escape' && setIsSearchOpen(false)}
                  placeholder="Search kaftans, fabrics, styles..."
                  className="flex-1 bg-transparent outline-none text-[11px] uppercase tracking-widest font-medium placeholder:text-brand-primary/25 placeholder:font-medium"
                />
                <button
                  type="submit"
                  disabled={!searchQuery.trim()}
                  className="text-[9px] uppercase tracking-widest font-bold text-brand-accent disabled:opacity-25 transition-opacity shrink-0"
                >
                  Search
                </button>
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className="text-brand-primary/30 hover:text-brand-primary transition-colors shrink-0"
                >
                  <X size={15} />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="md:hidden overflow-hidden bg-brand-secondary border-b border-brand-primary/10"
            >
              <div className="px-4 py-8 space-y-6 flex flex-col text-center font-serif text-xl">
                <Link to="/shop" onClick={() => setIsMobileMenuOpen(false)}>Shop All</Link>
                <Link to="/shop?category=traditional" onClick={() => setIsMobileMenuOpen(false)}>Traditional</Link>
                <Link to="/shop?category=modern" onClick={() => setIsMobileMenuOpen(false)}>Modern</Link>
                <Link to="/about" onClick={() => setIsMobileMenuOpen(false)}>About Us</Link>
                {!user && (
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-brand-maroon">
                    Sign In / Register
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Header;
