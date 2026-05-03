import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  doc,
  getDoc,
  setDoc,
  addDoc,
  collection,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Product, ProductColor } from '@/types';
import { toast } from 'sonner';
import { Plus, X, ArrowLeft } from 'lucide-react';

const Loader = () => (
  <div className="min-h-[40vh] flex items-center justify-center">
    <div className="space-y-4 text-center">
      <div className="w-10 h-10 border-2 border-brand-primary/20 border-t-brand-accent animate-spin mx-auto" />
      <p className="text-[10px] uppercase tracking-widest font-bold text-brand-primary/40">Loading</p>
    </div>
  </div>
);

type FormState = {
  name: string;
  description: string;
  narrative: string;
  shippingCare: string;
  category: string;
  price: string;
  discountedPrice: string;
  stock: string;
  sizesRaw: string;
  colors: ProductColor[];
  images: string[];
  isActive: boolean;
  rating: string;
  reviewsCount: string;
};

const EMPTY_FORM: FormState = {
  name: '',
  description: '',
  narrative: '',
  shippingCare: '',
  category: '',
  price: '',
  discountedPrice: '',
  stock: '',
  sizesRaw: '',
  colors: [],
  images: [],
  isActive: true,
  rating: '0',
  reviewsCount: '0',
};

function productToForm(p: Product): FormState {
  return {
    name: p.name,
    description: p.description,
    narrative: p.narrative ?? '',
    shippingCare: p.shippingCare ?? '',
    category: p.category,
    price: String(p.price),
    discountedPrice: p.discountedPrice != null ? String(p.discountedPrice) : '',
    stock: String(p.stock),
    sizesRaw: p.sizes.join(', '),
    colors: p.colors,
    images: p.images,
    isActive: p.isActive,
    rating: String(p.rating),
    reviewsCount: String(p.reviewsCount),
  };
}

export default function ProductForm() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === 'new';
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');

  useEffect(() => {
    if (isNew) return;
    const fetchProduct = async () => {
      try {
        const snap = await getDoc(doc(db, 'products', id!));
        if (snap.exists()) {
          setForm(productToForm({ id: snap.id, ...snap.data() } as Product));
        } else {
          toast.error('Product not found.');
          navigate('/admin/products');
        }
      } catch {
        toast.error('Failed to load product.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleColorChange = (
    index: number,
    field: keyof ProductColor,
    value: string
  ) => {
    const updated = form.colors.map((c, i) =>
      i === index ? { ...c, [field]: value } : c
    );
    set('colors', updated);
  };

  const addColor = () => set('colors', [...form.colors, { name: '', hex: '#000000' }]);

  const removeColor = (index: number) =>
    set('colors', form.colors.filter((_, i) => i !== index));

  const addImage = () => {
    const url = newImageUrl.trim();
    if (!url) return;
    set('images', [...form.images, url]);
    setNewImageUrl('');
  };

  const removeImage = (index: number) =>
    set('images', form.images.filter((_, i) => i !== index));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim() || !form.price || !form.stock) {
      toast.error('Name, price, and stock are required.');
      return;
    }

    setSaving(true);
    try {
      const data = {
        name: form.name.trim(),
        description: form.description.trim(),
        narrative: form.narrative.trim(),
        shippingCare: form.shippingCare.trim(),
        category: form.category.trim(),
        price: Number(form.price),
        discountedPrice: form.discountedPrice ? Number(form.discountedPrice) : null,
        stock: Number(form.stock),
        sizes: form.sizesRaw.split(',').map(s => s.trim()).filter(Boolean),
        colors: form.colors.filter(c => c.name.trim()),
        images: form.images,
        isActive: form.isActive,
        rating: Number(form.rating) || 0,
        reviewsCount: Number(form.reviewsCount) || 0,
        currencies: {},
      };

      if (isNew) {
        await addDoc(collection(db, 'products'), {
          ...data,
          createdAt: serverTimestamp(),
        });
        toast.success('Product created.');
      } else {
        await setDoc(doc(db, 'products', id!), data, { merge: true });
        toast.success('Product updated.');
      }
      navigate('/admin/products');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save product.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  const inputClass =
    'w-full h-10 border border-brand-primary/20 px-3 text-sm focus:outline-none focus:border-brand-primary bg-white rounded-none';
  const textareaClass =
    'w-full border border-brand-primary/20 px-3 py-2 text-sm focus:outline-none focus:border-brand-primary bg-white rounded-none resize-y';
  const labelClass = 'block text-[10px] uppercase tracking-widest font-bold text-brand-primary/50 mb-1';

  return (
    <div className="p-6 md:p-10 max-w-3xl space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-brand-primary/10 pb-6">
        <button
          onClick={() => navigate('/admin/products')}
          className="text-brand-primary/40 hover:text-brand-primary transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-serif tracking-tight">
            {isNew ? 'New Product' : 'Edit Product'}
          </h1>
          <p className="text-[10px] uppercase tracking-widest font-bold text-brand-primary/40 mt-1">
            {isNew ? 'Add a new product to the catalogue' : 'Update product details'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Basic Info */}
        <section className="space-y-4">
          <h2 className="text-[10px] uppercase tracking-widest font-bold text-brand-primary/50 border-b border-brand-primary/10 pb-2">
            Basic Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelClass}>Name *</label>
              <input
                className={inputClass}
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="e.g. Luxury Zari Silk Dera"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>Description *</label>
              <textarea
                className={textareaClass}
                rows={3}
                value={form.description}
                onChange={e => set('description', e.target.value)}
                placeholder="Short product description"
              />
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>Narrative (long story)</label>
              <textarea
                className={textareaClass}
                rows={4}
                value={form.narrative}
                onChange={e => set('narrative', e.target.value)}
                placeholder="Longer editorial narrative shown on product page"
              />
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>Shipping &amp; Care</label>
              <textarea
                className={textareaClass}
                rows={2}
                value={form.shippingCare}
                onChange={e => set('shippingCare', e.target.value)}
                placeholder="e.g. Dry clean only. Do not bleach."
              />
            </div>

            <div>
              <label className={labelClass}>Category</label>
              <input
                className={inputClass}
                value={form.category}
                onChange={e => set('category', e.target.value)}
                placeholder="e.g. traditional, modern"
              />
            </div>

            <div>
              <label className={labelClass}>Sizes (comma-separated)</label>
              <input
                className={inputClass}
                value={form.sizesRaw}
                onChange={e => set('sizesRaw', e.target.value)}
                placeholder="e.g. S, M, L, XL or One Size"
              />
            </div>
          </div>
        </section>

        {/* Pricing & Stock */}
        <section className="space-y-4">
          <h2 className="text-[10px] uppercase tracking-widest font-bold text-brand-primary/50 border-b border-brand-primary/10 pb-2">
            Pricing &amp; Stock
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className={labelClass}>Price (KES) *</label>
              <input
                className={inputClass}
                type="number"
                min="0"
                value={form.price}
                onChange={e => set('price', e.target.value)}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Sale Price (KES)</label>
              <input
                className={inputClass}
                type="number"
                min="0"
                value={form.discountedPrice}
                onChange={e => set('discountedPrice', e.target.value)}
                placeholder="Optional"
              />
            </div>
            <div>
              <label className={labelClass}>Stock *</label>
              <input
                className={inputClass}
                type="number"
                min="0"
                value={form.stock}
                onChange={e => set('stock', e.target.value)}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Rating</label>
              <input
                className={inputClass}
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={form.rating}
                onChange={e => set('rating', e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Colors */}
        <section className="space-y-4">
          <h2 className="text-[10px] uppercase tracking-widest font-bold text-brand-primary/50 border-b border-brand-primary/10 pb-2">
            Colors
          </h2>
          <div className="space-y-2">
            {form.colors.map((color, i) => (
              <div key={i} className="flex items-center gap-3">
                <input
                  type="color"
                  value={color.hex}
                  onChange={e => handleColorChange(i, 'hex', e.target.value)}
                  className="h-10 w-12 cursor-pointer border border-brand-primary/20 p-0.5 rounded-none"
                />
                <input
                  className="flex-1 h-10 border border-brand-primary/20 px-3 text-sm focus:outline-none focus:border-brand-primary bg-white rounded-none"
                  value={color.name}
                  onChange={e => handleColorChange(i, 'name', e.target.value)}
                  placeholder="Color name (e.g. Gold)"
                />
                <button
                  type="button"
                  onClick={() => removeColor(i)}
                  className="p-2 text-brand-primary/30 hover:text-brand-maroon transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addColor}
            className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-brand-accent hover:text-brand-primary transition-colors"
          >
            <Plus size={14} />
            Add Color
          </button>
        </section>

        {/* Images */}
        <section className="space-y-4">
          <h2 className="text-[10px] uppercase tracking-widest font-bold text-brand-primary/50 border-b border-brand-primary/10 pb-2">
            Images
          </h2>
          <div className="space-y-2">
            {form.images.map((url, i) => (
              <div key={i} className="flex items-center gap-3">
                <img
                  src={url}
                  alt=""
                  className="w-10 h-14 object-cover shrink-0"
                  referrerPolicy="no-referrer"
                />
                <span className="flex-1 text-[10px] text-brand-primary/50 truncate font-mono">
                  {url}
                </span>
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="p-2 text-brand-primary/30 hover:text-brand-maroon transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              className="flex-1 h-10 border border-brand-primary/20 px-3 text-sm focus:outline-none focus:border-brand-primary bg-white rounded-none"
              value={newImageUrl}
              onChange={e => setNewImageUrl(e.target.value)}
              placeholder="Paste image URL"
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addImage(); } }}
            />
            <button
              type="button"
              onClick={addImage}
              className="h-10 px-4 border border-brand-primary/20 text-[10px] uppercase tracking-widest font-bold hover:bg-brand-primary hover:text-brand-secondary transition-colors"
            >
              Add
            </button>
          </div>
        </section>

        {/* Active */}
        <section className="flex items-center gap-3">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={e => set('isActive', e.target.checked)}
              className="sr-only"
            />
            <div
              className={`w-10 h-5 transition-colors ${
                form.isActive ? 'bg-brand-accent' : 'bg-brand-primary/20'
              }`}
            >
              <span
                className={`block h-4 w-4 bg-white mt-0.5 transition-transform ${
                  form.isActive ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </div>
          </label>
          <span className="text-[10px] uppercase tracking-widest font-bold text-brand-primary/60">
            {form.isActive ? 'Active — visible in shop' : 'Inactive — hidden from shop'}
          </span>
        </section>

        {/* Actions */}
        <div className="flex gap-4 pt-4 border-t border-brand-primary/10">
          <button
            type="submit"
            disabled={saving}
            className="btn-luxury text-[10px] uppercase tracking-widest font-bold h-10 px-8 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : isNew ? 'Create Product' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="h-10 px-6 border border-brand-primary/20 text-[10px] uppercase tracking-widest font-bold text-brand-primary/50 hover:text-brand-primary hover:border-brand-primary transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
