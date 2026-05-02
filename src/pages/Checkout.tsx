import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, ShieldCheck, CreditCard, Smartphone, Loader2 } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'motion/react';
import { db, functions } from '../lib/firebase';
import { httpsCallable } from 'firebase/functions';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { OrderStatus } from '../types';
import { toast } from 'sonner';

const callStkPush    = httpsCallable<{ phone: string; amount: number; orderId: string },    { checkoutRequestId: string; customerMessage: string }>(functions, 'stkPush');
const callMpesaStatus = httpsCallable<{ checkoutRequestId: string }, { ResultCode?: string; ResultDesc?: string; errorCode?: string }>(functions, 'mpesaStatus');

const Checkout = () => {
  const { items, total, clearCart } = useCart();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState({
    fullName: '',
    phone: '',
    city: 'Nairobi',
    details: ''
  });

  // Stable order ID for this checkout session — used as the idempotency key so
  // retrying the same payment never triggers a second STK push.
  const [orderId] = useState(
    () => 'KQ-' + Math.random().toString(36).substring(2, 9).toUpperCase()
  );
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = () => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
  };

  useEffect(() => () => clearTimers(), []);

  const handleSTKPush = async () => {
    const phone = phoneNumber || address.phone;
    setIsProcessing(true);

    try {
      // Initiate STK push via Cloud Function (idempotent — same orderId won't double-charge)
      const { data: stkData } = await callStkPush({ phone, amount: total, orderId });
      const { checkoutRequestId } = stkData;
      toast.info(`STK push sent to ${phone} — enter your M-Pesa PIN.`);

      // Poll the Cloud Function every 3 s until Daraja returns a final result
      pollRef.current = setInterval(async () => {
        try {
          const { data: status } = await callMpesaStatus({ checkoutRequestId });

          // Daraja returns errorCode when still processing — keep polling
          if (status.errorCode) return;

          const code = String(status.ResultCode ?? '');

          if (code === '0') {
            clearTimers();
            await addDoc(collection(db, 'orders'), {
              userId: user?.uid ?? 'guest',
              items,
              total,
              status: OrderStatus.PAID,
              mpesaTransactionId: checkoutRequestId,
              address,
              createdAt: serverTimestamp(),
              trackingNumber: orderId,
              deliveryEstimate: '2-3 Business Days',
            });
            clearCart();
            setIsProcessing(false);
            setStep(3);
            toast.success('Payment received — order confirmed!');
          } else if (code !== '') {
            clearTimers();
            setIsProcessing(false);
            toast.error(status.ResultDesc ?? 'Payment failed or was cancelled.');
          }
        } catch {
          // transient error — keep polling
        }
      }, 3000);

      // Auto-cancel after 90 s if the user never responds to the prompt
      timeoutRef.current = setTimeout(() => {
        if (pollRef.current) {
          clearTimers();
          setIsProcessing(false);
          toast.error('Payment timed out. Please try again.');
        }
      }, 90_000);
    } catch (err: unknown) {
      setIsProcessing(false);
      const msg = (err as { message?: string })?.message ?? 'Payment failed. Try again.';
      toast.error(msg);
    }
  };

  return (
    <div className="container mx-auto px-4 py-20 pb-40">
      <div className="max-w-4xl mx-auto space-y-16">
        {/* Checkout Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-serif tracking-tight">Secure Checkout</h1>
          <div className="flex justify-center items-center space-x-12 relative max-w-sm mx-auto">
            <div className={`h-1 flex-1 ${step >= 1 ? 'bg-brand-accent' : 'bg-brand-primary/10'}`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${step >= 1 ? 'border-brand-accent bg-brand-accent text-brand-primary' : 'border-brand-primary/10'}`}>
              <span className="text-[10px] font-bold">01</span>
            </div>
            <div className={`h-1 flex-1 ${step >= 2 ? 'bg-brand-accent' : 'bg-brand-primary/10'}`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${step >= 2 ? 'border-brand-accent bg-brand-accent text-brand-primary' : 'border-brand-primary/10'}`}>
              <span className="text-[10px] font-bold">02</span>
            </div>
            <div className={`h-1 flex-1 ${step >= 3 ? 'bg-brand-accent' : 'bg-brand-primary/10'}`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${step >= 3 ? 'border-brand-accent bg-brand-accent text-brand-primary' : 'border-brand-primary/10'}`}>
              <CheckCircle2 size={16} />
            </div>
          </div>
          <p className="text-[10px] uppercase font-bold tracking-[0.3em] opacity-40">
            {step === 1 && 'Delivery Logistics'}
            {step === 2 && 'M-Pesa Payment'}
            {step === 3 && 'Order Confirmed'}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-16"
            >
              <div className="space-y-8">
                <h3 className="text-xl font-serif uppercase tracking-widest border-b border-brand-primary/10 pb-4">Delivery Coordinates</h3>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold tracking-widest opacity-60">Full Name</label>
                    <Input 
                      value={address.fullName}
                      onChange={e => setAddress({...address, fullName: e.target.value})}
                      placeholder="e.g. Adama Traore"
                      className="rounded-none h-14 border-brand-primary/10 uppercase text-[10px] tracking-widest"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold tracking-widest opacity-60">M-Pesa Phone Number</label>
                    <Input 
                      value={address.phone}
                      onChange={e => setAddress({...address, phone: e.target.value})}
                      placeholder="e.g. 0700 000 000"
                      className="rounded-none h-14 border-brand-primary/10 uppercase text-[10px] tracking-widest"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold tracking-widest opacity-60">City</label>
                    <Input 
                      value={address.city}
                      onChange={e => setAddress({...address, city: e.target.value})}
                      placeholder="Nairobi"
                      className="rounded-none h-14 border-brand-primary/10 uppercase text-[10px] tracking-widest"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold tracking-widest opacity-60">Detailed Instructions</label>
                    <textarea 
                      value={address.details}
                      onChange={e => setAddress({...address, details: e.target.value})}
                      placeholder="Apt, Suite, landmarks..."
                      className="w-full bg-transparent border border-brand-primary/10 p-4 min-h-[120px] focus:outline-none focus:border-brand-accent uppercase text-[10px] tracking-widest transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-brand-primary/5 p-10 h-fit space-y-8">
                <h3 className="text-xl font-serif uppercase tracking-widest border-b border-brand-primary/20 pb-4">Your Selection</h3>
                <div className="space-y-4 max-h-64 overflow-y-auto pr-4 scrollbar-hide">
                  {items.map(item => (
                    <div key={`${item.productId}-${item.size}`} className="flex justify-between items-center text-[10px] uppercase tracking-widest font-bold">
                      <div className="flex items-center gap-4">
                        <span className="opacity-40">{item.quantity}×</span>
                        <span>{item.name}</span>
                      </div>
                      <span>{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <Separator className="bg-brand-primary/10" />
                <div className="flex justify-between items-center font-bold uppercase tracking-widest">
                  <span>Grand Total</span>
                  <span className="text-xl">Kes {total.toLocaleString()}</span>
                </div>
                <Button 
                  className="btn-luxury w-full h-16 uppercase tracking-widest font-bold"
                  onClick={() => setStep(2)}
                  disabled={!address.fullName || !address.phone}
                >
                  Proceed to Payment
                </Button>
                <div className="flex items-center justify-center space-x-2 text-[8px] uppercase tracking-widest font-bold opacity-40">
                  <ShieldCheck size={14} className="text-brand-accent" />
                  <span>Your data is protected by industry standard encryption</span>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-md mx-auto bg-white border border-brand-primary/10 p-12 text-center space-y-10"
            >
              <div className="bg-green-50 p-6 rounded-full w-24 h-24 mx-auto flex items-center justify-center">
                <Smartphone size={40} className="text-green-600" />
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-serif">M-Pesa STK Push</h3>
                <p className="text-[10px] uppercase tracking-widest font-bold opacity-60 leading-relaxed">
                  Enter your M-Pesa number below. You will receive a prompt on your phone to enter your PIN to complete the payment of <b>Kes {total.toLocaleString()}</b>.
                </p>
              </div>
              
              <div className="space-y-6">
                <div className="relative">
                  <Input 
                    value={phoneNumber || address.phone}
                    onChange={e => setPhoneNumber(e.target.value)}
                    className="h-16 text-center text-xl font-bold tracking-[0.2em] border-brand-primary/10 focus:ring-brand-accent rounded-none"
                    placeholder="07XX XXX XXX"
                  />
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-primary text-brand-secondary font-bold text-[8px] tracking-widest uppercase rounded-none px-4">SAFARICOM</Badge>
                </div>
                
                <Button 
                  className="btn-luxury w-full h-16 uppercase tracking-[0.2em] font-bold"
                  onClick={handleSTKPush}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <div className="flex items-center space-x-3">
                      <Loader2 className="animate-spin" size={20} />
                      <span>Verifying...</span>
                    </div>
                  ) : (
                    <span>Initiate M-Pesa Prompt</span>
                  )}
                </Button>
                
                <button 
                  onClick={() => setStep(1)}
                  className="text-[10px] uppercase tracking-widest font-bold opacity-40 hover:opacity-100 hover:text-brand-accent transition-all"
                >
                  Go Back to Delivery Details
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-lg mx-auto bg-brand-primary text-brand-secondary p-16 text-center space-y-10"
            >
              <div className="w-20 h-20 bg-brand-accent rounded-full mx-auto flex items-center justify-center text-brand-primary">
                <CheckCircle2 size={40} />
              </div>
              <div className="space-y-4">
                <h2 className="text-4xl font-serif uppercase tracking-tight">Order Received</h2>
                <p className="text-[10px] uppercase tracking-[0.2em] font-medium opacity-60 leading-relaxed">
                  The queen's coronation has begun. Your order is now being processed by our master artisans in Nairobi.
                </p>
              </div>
              
              <div className="bg-white/5 p-8 border border-white/10 space-y-6">
                <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold opacity-60">
                  <span>Order Reference</span>
                  <span className="text-brand-accent">{orderId}</span>
                </div>
                <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold opacity-60">
                  <span>Payment Channel</span>
                  <span>M-Pesa STK Push</span>
                </div>
                <Separator className="bg-white/10" />
                <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold opacity-60">
                  <span>Delivery Estimate</span>
                  <span>48-72 Hours</span>
                </div>
              </div>

              <div className="space-y-4 pt-6">
                <Button 
                  className="w-full h-14 bg-brand-secondary text-brand-primary uppercase tracking-widest font-bold hover:bg-brand-accent transition-colors"
                  onClick={() => navigate('/profile?tab=orders')}
                >
                  Track Your Collection
                </Button>
                <Link 
                  to="/" 
                  className="block text-[10px] uppercase tracking-widest font-bold opacity-40 hover:opacity-100 transition-opacity"
                >
                  Continue Browsing
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Checkout;
