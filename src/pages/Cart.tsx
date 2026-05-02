import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, AlertCircle } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const Cart = () => {
  const { items, removeItem, updateQuantity, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-40 text-center space-y-8">
        <div className="mx-auto w-24 h-24 bg-brand-primary/5 rounded-full flex items-center justify-center">
          <ShoppingBag size={40} className="text-brand-primary/20" />
        </div>
        <div className="space-y-4">
          <h2 className="text-4xl font-serif">Your Collection is Empty</h2>
          <p className="text-brand-primary/60 uppercase tracking-widest text-[10px] font-bold">Discover our latest traditional and modern kaftans.</p>
        </div>
        <Link to="/shop">
          <Button className="btn-luxury h-14 px-12 text-xs uppercase tracking-widest font-bold mt-4">
            Start Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-20 pb-32">
      <div className="max-w-6xl mx-auto space-y-12">
        <h1 className="text-5xl font-serif tracking-tight">Your Registry</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-20">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-10">
            {items.map((item) => (
              <div key={`${item.productId}-${item.size}-${item.color}`} className="flex gap-8 group">
                <div className="w-32 aspect-[3/4] bg-gray-100 overflow-hidden flex-shrink-0">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    referrerPolicy="no-referrer"
                  />
                </div>
                
                <div className="flex-1 flex flex-col justify-between py-2">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <h3 className="font-serif text-xl tracking-tight leading-none">{item.name}</h3>
                      <button 
                        onClick={() => removeItem(item.productId, item.size, item.color)}
                        className="text-brand-primary/40 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <div className="flex space-x-4 text-[10px] uppercase font-bold tracking-widest opacity-40">
                      <span>Ref: KQ-{item.productId}</span>
                      <span>Size: {item.size}</span>
                      <span>Color: {item.color}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-end">
                    <div className="flex items-center border h-10 px-3 space-x-10">
                      <button 
                        onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity - 1)}
                        className="text-sm opacity-40 hover:opacity-100"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity + 1)}
                        className="text-sm opacity-40 hover:opacity-100"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <span className="font-medium text-lg leading-none">Kes {(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="flex justify-start pt-8">
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger className="text-[10px] uppercase tracking-widest font-bold opacity-40 hover:opacity-100 hover:text-red-500 transition-all flex items-center gap-2 cursor-pointer bg-transparent border-none p-0">
                  <Trash2 size={14} />
                  Empty Entire Cart
                </DialogTrigger>
                <DialogContent className="rounded-none border-brand-primary/10">
                  <DialogHeader className="space-y-4">
                    <DialogTitle className="font-serif text-2xl tracking-tight">Clear Your Registry?</DialogTitle>
                    <DialogDescription className="text-[10px] uppercase font-bold tracking-widest opacity-60 leading-relaxed">
                      Are you sure you want to remove all items from your selection? This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="flex-col sm:flex-row gap-4 mt-8">
                    <Button 
                      variant="outline" 
                      onClick={() => setOpen(false)}
                      className="rounded-none border-brand-primary/10 uppercase text-[10px] tracking-widest font-bold h-12 flex-1"
                    >
                      Keep Items
                    </Button>
                    <Button 
                      onClick={() => {
                        clearCart();
                        setOpen(false);
                      }}
                      className="bg-red-500 hover:bg-red-600 text-white rounded-none uppercase text-[10px] tracking-widest font-bold h-12 flex-1"
                    >
                      Yes, Clear Cart
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white border border-brand-primary/10 p-10 h-fit space-y-8 sticky top-32">
            <h2 className="text-2xl font-serif uppercase tracking-widest">Summary</h2>
            
            <div className="space-y-4 uppercase text-[10px] tracking-[0.2em] font-medium">
              <div className="flex justify-between">
                <span className="opacity-40">Subtotal</span>
                <span>Kes {total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-40">VAT (16%)</span>
                <span>Included</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-40">Delivery</span>
                <span className="text-brand-accent">Calculated at next step</span>
              </div>
            </div>
            
            <Separator className="border-brand-primary/10" />
            
            <div className="flex justify-between uppercase tracking-widest font-bold">
              <span>Total</span>
              <span className="text-xl">Kes {total.toLocaleString()}</span>
            </div>
            
            <Button
              className="btn-luxury w-full h-14 uppercase tracking-widest text-[10px] font-bold flex items-center justify-center gap-3"
              onClick={() => navigate('/checkout')}
            >
              <span>Continue to Secure Checkout</span>
              <ArrowRight size={14} className="shrink-0" />
            </Button>
            
            <p className="text-[9px] uppercase tracking-widest opacity-40 text-center leading-relaxed">
              Express delivery available for Nairobi orders placed before 2 PM.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
