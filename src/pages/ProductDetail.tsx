import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Truck, ShieldCheck, Heart, ShoppingBag, RefreshCw, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductCard from '../components/ProductCard';
import Breadcrumbs from '../components/Breadcrumbs';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useWishlist } from '../contexts/WishlistContext';
import { Product, Review } from '../types';
import { getPersonalizedRecommendations } from '../lib/gemini';
import { addDoc, collection, serverTimestamp, doc, getDoc, getDocs, query, where, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { toast } from 'sonner';

const RATING_LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

const ProductDetail = () => {
  const { id } = useParams();
  const { addItem } = useCart();
  const { user } = useAuth();
  const { toggle, isWishlisted } = useWishlist();
  const wishlisted = id ? isWishlisted(id) : false;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState('');
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [localReviews, setLocalReviews] = useState<Review[]>([]);
  const [reviewRating, setReviewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!id) return;
    window.scrollTo(0, 0);
    setLoading(true);

    const loadProduct = async () => {
      try {
        const snap = await getDoc(doc(db, 'products', id));
        if (!snap.exists()) { setLoading(false); return; }
        const p = { id: snap.id, ...snap.data() } as Product;
        setProduct(p);
        setMainImage(p.images[0] ?? '');
        setSelectedSize(p.sizes[0] ?? '');
        setSelectedColor(p.colors[0]?.name ?? '');

        // Load reviews
        const revSnap = await getDocs(query(collection(db, 'reviews'), where('productId', '==', id)));
        setLocalReviews(revSnap.docs.map(d => ({ id: d.id, ...d.data() } as Review)));

        // Load recommendations (fetch a small pool to pass to Gemini)
        const poolSnap = await getDocs(query(collection(db, 'products'), where('isActive', '==', true), limit(10)));
        const pool = poolSnap.docs.map(d => ({ id: d.id, ...d.data() } as Product)).filter(p2 => p2.id !== id);
        const recs = await getPersonalizedRecommendations([id], pool);
        setRecommendations(recs);
      } catch {
        // silently fail — product just won't show
      }
      setLoading(false);
    };
    loadProduct();
  }, [id]);

  const handleSubmitReview = async () => {
    if (!user || reviewRating === 0 || !reviewComment.trim() || !product) return;
    setSubmittingReview(true);
    try {
      const payload = {
        productId: product.id,
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        rating: reviewRating,
        comment: reviewComment.trim(),
        createdAt: serverTimestamp(),
      };
      const docRef = await addDoc(collection(db, 'reviews'), payload);
      setLocalReviews(prev => [{ id: docRef.id, ...payload, createdAt: new Date() }, ...prev]);
      setReviewRating(0);
      setReviewComment('');
      toast.success('Review submitted. Thank you!');
    } catch {
      toast.error('Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-brand-primary/20 border-t-brand-accent animate-spin" />
    </div>
  );

  if (!product) return (
    <div className="container mx-auto px-4 py-40 text-center space-y-4">
      <p className="font-serif text-2xl opacity-40">Product not found</p>
      <Link to="/shop" className="text-brand-accent uppercase text-[10px] tracking-widest font-bold hover:underline">Back to Shop</Link>
    </div>
  );

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.discountedPrice ?? product.price,
      quantity,
      size: selectedSize,
      color: selectedColor,
      image: product.images[0] ?? ''
    });
    toast.success(`${product.name} added to cart`);
  };

  const displayPrice = product.discountedPrice ?? product.price;

  return (
    <div className="container mx-auto px-4 py-20 pb-32">
      <Breadcrumbs items={[{ label: 'Shop', href: '/shop' }, { label: product.name }]} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Image Gallery */}
        <div className="space-y-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="aspect-[3/4] bg-gray-100 overflow-hidden">
            <img src={mainImage} alt={product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </motion.div>
          <div className="flex space-x-4">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setMainImage(img)}
                className={`w-24 aspect-[3/4] bg-gray-100 overflow-hidden border-2 transition-all ${mainImage === img ? 'border-brand-accent' : 'border-transparent opacity-60 hover:opacity-100'}`}
              >
                <img src={img} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </button>
            ))}
          </div>
        </div>

        {/* Product Details */}
        <div className="space-y-10">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] font-bold text-brand-maroon">{product.category}</p>
            <h1 className="text-4xl md:text-5xl font-serif tracking-tight leading-tight">{product.name}</h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-medium">Kes {displayPrice.toLocaleString()}</span>
                {product.discountedPrice && (
                  <span className="text-sm line-through opacity-40">Kes {product.price.toLocaleString()}</span>
                )}
              </div>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center space-x-1 text-brand-accent">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={16} fill={i < Math.floor(product.rating) ? "currentColor" : "none"} />
                ))}
                <span className="text-[10px] text-brand-primary uppercase tracking-widest font-bold ml-2">({product.reviewsCount} Reviews)</span>
              </div>
            </div>
          </div>

          <p className="text-brand-primary/70 leading-relaxed max-w-lg uppercase text-[10px] tracking-widest font-medium">
            {product.description}
          </p>

          <Separator className="border-brand-primary/10" />

          {/* Configuration */}
          <div className="space-y-8">
            {/* Colors */}
            <div className="space-y-4">
              <p className="text-[10px] uppercase tracking-widest font-bold">Select Shade: <span className="text-brand-accent">{selectedColor}</span></p>
              <div className="flex space-x-3">
                {product.colors.map(color => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    title={color.name}
                    className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${selectedColor === color.name ? 'border-brand-accent scale-110' : 'border-brand-primary/20 hover:border-brand-accent/60'}`}
                  >
                    <div
                      className="w-7 h-7 rounded-full shadow-inner"
                      style={{ backgroundColor: color.hex, border: color.hex === '#F5F2ED' || color.hex === '#FFFFF0' ? '1px solid #ccc' : undefined }}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-[10px] uppercase tracking-widest font-bold">Select Size</p>
                <Link to="/size-guide" className="text-[10px] uppercase tracking-widest font-bold text-brand-accent hover:underline">Size Guide</Link>
              </div>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[50px] h-10 border text-[10px] uppercase tracking-widest font-bold transition-all px-4 ${selectedSize === size ? 'bg-brand-primary text-brand-secondary' : 'bg-transparent border-brand-primary/20 opacity-60 hover:opacity-100 hover:border-brand-accent'}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="space-y-4">
              <p className="text-[10px] uppercase tracking-widest font-bold">Quantity</p>
              <div className="flex items-center space-x-4 border w-32 justify-between px-4 h-12 bg-white/50">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-lg disabled:opacity-30" disabled={quantity <= 1}>-</button>
                <span className="font-bold text-xs uppercase">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="text-lg disabled:opacity-30" disabled={quantity >= product.stock}>+</button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <Button
              className="btn-luxury h-16 flex-1 flex items-center justify-center space-x-3 text-sm uppercase tracking-[0.2em] font-bold"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              <ShoppingBag size={20} />
              <span>{product.stock === 0 ? 'Sold Out' : 'Add to Collection'}</span>
            </Button>
            <Button
              variant="outline"
              className={`h-16 w-full sm:w-16 border-brand-primary/20 flex items-center justify-center p-0 hover:bg-brand-accent/10 hover:text-brand-accent ${wishlisted ? 'bg-brand-accent/10 text-brand-accent border-brand-accent/40' : ''}`}
              onClick={() => id && toggle(id)}
            >
              <Heart size={20} fill={wishlisted ? 'currentColor' : 'none'} />
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-8 pt-10 border-t border-brand-primary/10">
            <div className="flex items-center space-x-3 text-[10px] opacity-60 uppercase tracking-widest font-bold">
              <Truck size={18} className="text-brand-accent" />
              <span>Stellar Logistics Delivery</span>
            </div>
            <div className="flex items-center space-x-3 text-[10px] opacity-60 uppercase tracking-widest font-bold">
              <RefreshCw size={18} className="text-brand-accent" />
              <span>7 Day Returns Guaranteed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Narrative & Details Tabs */}
      <div className="mt-20">
        <Tabs defaultValue="details" className="w-full">
          <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden border-b border-brand-primary/10">
            <TabsList className="flex min-w-max bg-transparent border-none h-auto p-0 rounded-none gap-6 sm:gap-10">
              <TabsTrigger value="details" className="px-0 py-4 shrink-0 bg-transparent data-active:bg-transparent text-brand-primary/40 data-active:text-brand-maroon uppercase text-[10px] sm:text-xs tracking-wider sm:tracking-widest font-bold transition-colors rounded-none shadow-none data-active:[box-shadow:inset_0_-2px_0_0_var(--color-brand-maroon)]">
                The Narrative
              </TabsTrigger>
              <TabsTrigger value="shipping" className="px-0 py-4 shrink-0 bg-transparent data-active:bg-transparent text-brand-primary/40 data-active:text-brand-maroon uppercase text-[10px] sm:text-xs tracking-wider sm:tracking-widest font-bold transition-colors rounded-none shadow-none data-active:[box-shadow:inset_0_-2px_0_0_var(--color-brand-maroon)]">
                Shipping & Care
              </TabsTrigger>
              <TabsTrigger value="reviews" className="px-0 py-4 shrink-0 bg-transparent data-active:bg-transparent text-brand-primary/40 data-active:text-brand-maroon uppercase text-[10px] sm:text-xs tracking-wider sm:tracking-widest font-bold transition-colors rounded-none shadow-none data-active:[box-shadow:inset_0_-2px_0_0_var(--color-brand-maroon)]">
                Reviews ({product.reviewsCount})
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="details" className="py-12 max-w-4xl space-y-6">
            <p className="text-brand-primary/70 leading-relaxed text-sm whitespace-pre-line">
              {product.narrative || product.description}
            </p>
          </TabsContent>

          <TabsContent value="shipping" className="py-12 max-w-4xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
              <div className="space-y-5">
                <div className="w-10 h-10 bg-brand-accent/10 flex items-center justify-center">
                  <ShieldCheck size={18} className="text-brand-accent" />
                </div>
                <h4 className="text-xs uppercase tracking-widest font-bold">Care Instructions</h4>
                <p className="text-sm text-brand-primary/70 leading-relaxed whitespace-pre-line">
                  {product.shippingCare || 'Dry clean only. Do not bleach. Steam iron on low heat to maintain fabric integrity.'}
                </p>
              </div>
              <div className="space-y-5">
                <div className="w-10 h-10 bg-brand-accent/10 flex items-center justify-center">
                  <Truck size={18} className="text-brand-accent" />
                </div>
                <h4 className="text-xs uppercase tracking-widest font-bold">Delivery</h4>
                <div className="space-y-2 text-sm text-brand-primary/70 leading-relaxed">
                  <p>Nairobi — 24 to 48 hours</p>
                  <p>Countrywide — 2 to 4 business days</p>
                  <p>International — 5 to 10 business days via DHL Express</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="py-12 max-w-4xl space-y-12">
            {user ? (
              <div className="border border-brand-primary/10 p-6 sm:p-8 space-y-6">
                <h3 className="text-[10px] uppercase tracking-[0.25em] font-bold">Share Your Experience</h3>
                <div className="space-y-2">
                  <p className="text-[9px] uppercase tracking-widest font-bold text-brand-primary/40">Your Rating</p>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button key={star} type="button" onClick={() => setReviewRating(star)} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)} className="p-0.5 transition-transform hover:scale-110">
                        <Star size={28} fill={(hoverRating || reviewRating) >= star ? 'currentColor' : 'none'} strokeWidth={1.5} className={(hoverRating || reviewRating) >= star ? 'text-brand-accent' : 'text-brand-primary/20'} />
                      </button>
                    ))}
                    {(hoverRating || reviewRating) > 0 && (
                      <span className="ml-3 text-[10px] uppercase tracking-widest font-bold text-brand-accent">
                        {RATING_LABELS[hoverRating || reviewRating]}
                      </span>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-[9px] uppercase tracking-widest font-bold text-brand-primary/40">Your Experience</p>
                  <textarea value={reviewComment} onChange={e => setReviewComment(e.target.value.slice(0, 500))} placeholder="Describe the quality, fit, and how it made you feel..." rows={4} className="w-full border border-brand-primary/15 bg-transparent px-4 py-3 text-sm resize-none focus:outline-none focus:border-brand-accent transition-colors placeholder:text-brand-primary/25" />
                  <p className="text-[9px] uppercase tracking-widest font-bold text-brand-primary/25 text-right">{reviewComment.length} / 500</p>
                </div>
                <Button onClick={handleSubmitReview} disabled={submittingReview || reviewRating === 0 || !reviewComment.trim()} className="btn-luxury h-12 px-8 uppercase text-[10px] tracking-widest font-bold disabled:opacity-40 flex items-center gap-2">
                  {submittingReview && <Loader2 size={14} className="animate-spin" />}
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </Button>
              </div>
            ) : (
              <div className="border border-brand-primary/10 bg-brand-primary/[0.02] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-serif">Share your experience</p>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-brand-primary/40">Sign in to write a review for this piece.</p>
                </div>
                <Link to="/login" state={{ from: `/product/${product.id}` }}>
                  <Button variant="outline" className="h-10 px-6 uppercase text-[10px] tracking-widest font-bold border-brand-primary/15 shrink-0 hover:bg-brand-primary hover:text-brand-secondary">Sign In to Review</Button>
                </Link>
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-16">
              <div className="w-full md:w-56 space-y-5 shrink-0">
                <div className="text-6xl font-serif">{product.rating.toFixed(1)}</div>
                <div className="flex items-center space-x-1 text-brand-accent">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={20} fill={i < Math.floor(product.rating) ? 'currentColor' : 'none'} strokeWidth={1.5} />
                  ))}
                </div>
                <p className="text-[10px] uppercase tracking-widest font-bold opacity-40">Based on {product.reviewsCount} reviews</p>
              </div>
              <div className="flex-1 space-y-10">
                {localReviews.length === 0 ? (
                  <p className="text-sm text-brand-primary/40 font-serif italic pt-4">Be the first to review this piece.</p>
                ) : (
                  localReviews.map(review => (
                    <div key={review.id} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-brand-accent/15 flex items-center justify-center text-xs font-bold text-brand-accent shrink-0">
                            {review.userName.charAt(0)}
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-bold uppercase tracking-widest leading-none">{review.userName}</p>
                            <div className="flex items-center space-x-0.5 text-brand-accent">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} size={11} fill={i < review.rating ? 'currentColor' : 'none'} strokeWidth={1.5} />
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] uppercase opacity-40 font-bold tracking-widest">
                          {review.createdAt?.toDate ? review.createdAt.toDate().toLocaleDateString() : new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-brand-primary/70 text-sm leading-relaxed pl-12">"{review.comment}"</p>
                      <Separator className="bg-brand-primary/5" />
                    </div>
                  ))
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <section className="mt-40 space-y-12">
          <div className="space-y-2 text-center">
            <p className="text-xs uppercase tracking-[0.3em] font-bold text-brand-maroon italic">Curated for your style</p>
            <h2 className="text-4xl font-serif">Complete the Look</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12">
            {recommendations.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetail;
