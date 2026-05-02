import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { showWelcomeToast } from '../lib/toasts';

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
    <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const Login = () => {
  const { loginWithGoogle, loginWithFacebook, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [isLoadingFacebook, setIsLoadingFacebook] = useState(false);

  const from = (location.state as { from?: string })?.from || '/';

  useEffect(() => {
    if (!loading && user) {
      navigate(from, { replace: true });
    }
  }, [user, loading, navigate, from]);

  const handleGoogle = async () => {
    setIsLoadingGoogle(true);
    try {
      const signedInUser = await loginWithGoogle();
      showWelcomeToast(signedInUser.displayName);
    } catch (err: any) {
      toast.error(err?.message || 'Google sign-in failed. Please try again.');
    } finally {
      setIsLoadingGoogle(false);
    }
  };

  const handleFacebook = async () => {
    setIsLoadingFacebook(true);
    try {
      const signedInUser = await loginWithFacebook();
      showWelcomeToast(signedInUser.displayName);
    } catch (err: any) {
      toast.error(err?.message || 'Facebook sign-in failed. Please try again.');
    } finally {
      setIsLoadingFacebook(false);
    }
  };

  if (loading) return null;

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left — Brand Image Panel */}
      <div className="hidden lg:block relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1618333234973-22874136934c?q=80&w=1200&auto=format&fit=crop"
          alt="Kaftan Queens"
          className="absolute inset-0 w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-primary/90 via-brand-primary/40 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end p-16 text-brand-secondary">
          <Link to="/" className="absolute top-10 left-10 flex items-center gap-2 text-brand-secondary/70 hover:text-brand-secondary transition-colors text-xs uppercase tracking-widest font-bold">
            <ArrowLeft size={14} />
            Back to Shop
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="space-y-4"
          >
            <p className="text-xs uppercase tracking-[0.3em] font-bold text-brand-accent">Welcome Back</p>
            <h2 className="text-5xl font-serif leading-tight">
              Dressed for<br />
              <span className="text-brand-accent italic">Royalty.</span>
            </h2>
            <p className="text-sm uppercase tracking-widest opacity-60 max-w-xs leading-relaxed font-medium">
              Sign in to access your collection, track orders, and unlock exclusive offers.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right — Auth Panel */}
      <div className="flex flex-col justify-center px-8 md:px-16 lg:px-20 py-16 bg-brand-secondary">
        {/* Mobile back link */}
        <Link
          to="/"
          className="lg:hidden mb-10 flex items-center gap-2 text-brand-primary/50 hover:text-brand-primary transition-colors text-xs uppercase tracking-widest font-bold"
        >
          <ArrowLeft size={14} />
          Back to Shop
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-sm w-full mx-auto space-y-10"
        >
          {/* Logo */}
          <div className="space-y-3">
            <Link to="/" className="text-3xl font-serif font-bold tracking-tighter hover:text-brand-accent transition-colors">
              KAFTAN QUEENS
            </Link>
            <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-brand-primary/40">
              Your Royal Account
            </p>
          </div>

          {/* Sign-in buttons */}
          <div className="space-y-4">
            <button
              onClick={handleGoogle}
              disabled={isLoadingGoogle || isLoadingFacebook}
              className="w-full h-14 flex items-center justify-center gap-4 border border-brand-primary/15 bg-white hover:bg-brand-primary/5 hover:border-brand-primary/30 transition-all text-xs uppercase tracking-[0.2em] font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoadingGoogle ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <GoogleIcon />
              )}
              <span>{isLoadingGoogle ? 'Signing in...' : 'Continue with Google'}</span>
            </button>

            <button
              onClick={handleFacebook}
              disabled={isLoadingGoogle || isLoadingFacebook}
              className="w-full h-14 flex items-center justify-center gap-4 border border-brand-primary/15 bg-white hover:bg-brand-primary/5 hover:border-brand-primary/30 transition-all text-xs uppercase tracking-[0.2em] font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoadingFacebook ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <FacebookIcon />
              )}
              <span>{isLoadingFacebook ? 'Signing in...' : 'Continue with Facebook'}</span>
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-brand-primary/10" />
            <span className="text-[9px] uppercase tracking-[0.3em] font-bold text-brand-primary/30">or</span>
            <div className="flex-1 h-px bg-brand-primary/10" />
          </div>

          {/* Info note */}
          <div className="bg-brand-primary/5 border border-brand-primary/10 p-5 space-y-2">
            <p className="text-[10px] uppercase tracking-widest font-bold text-brand-primary/50">New here?</p>
            <p className="text-[11px] text-brand-primary/60 leading-relaxed tracking-wide">
              Signing in automatically creates your Kaftan Queens account. No separate registration needed.
            </p>
          </div>

          {/* Footer links */}
          <div className="flex justify-between text-[9px] uppercase tracking-widest font-bold text-brand-primary/30">
            <Link to="/shop" className="hover:text-brand-primary transition-colors">Browse Without Account</Link>
            <Link to="/faq" className="hover:text-brand-primary transition-colors">Help</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
