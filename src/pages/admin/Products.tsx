import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  collection,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Product } from '@/types';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const Loader = () => (
  <div className="min-h-[40vh] flex items-center justify-center">
    <div className="space-y-4 text-center">
      <div className="w-10 h-10 border-2 border-brand-primary/20 border-t-brand-accent animate-spin mx-auto" />
      <p className="text-[10px] uppercase tracking-widest font-bold text-brand-primary/40">Loading</p>
    </div>
  </div>
);

export default function Products() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      const snap = await getDocs(
        query(collection(db, 'products'), orderBy('createdAt', 'desc'))
      );
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Product)));
    } catch (err) {
      console.error(err);
      toast.error('Failed to load products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleToggleActive = async (product: Product) => {
    setTogglingId(product.id);
    try {
      await updateDoc(doc(db, 'products', product.id), { isActive: !product.isActive });
      setProducts(prev =>
        prev.map(p => p.id === product.id ? { ...p, isActive: !p.isActive } : p)
      );
      toast.success(`Product ${product.isActive ? 'deactivated' : 'activated'}.`);
    } catch {
      toast.error('Failed to update product.');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (product: Product) => {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    try {
      await deleteDoc(doc(db, 'products', product.id));
      setProducts(prev => prev.filter(p => p.id !== product.id));
      toast.success('Product deleted.');
    } catch {
      toast.error('Failed to delete product.');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="p-6 md:p-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-brand-primary/10 pb-6">
        <div>
          <h1 className="text-3xl font-serif tracking-tight">Products</h1>
          <p className="text-[10px] uppercase tracking-widest font-bold text-brand-primary/40 mt-1">
            {products.length} total
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/products/new')}
          className="btn-luxury inline-flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold h-10 px-5"
        >
          <Plus size={14} />
          New Product
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-brand-primary/10">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-brand-primary text-brand-secondary text-[9px] uppercase tracking-[0.2em] font-bold">
              <th className="px-4 py-3 w-14">Image</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Sale Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Active</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="text-[10px] uppercase tracking-widest font-bold">
            {products.map(product => (
              <tr
                key={product.id}
                className="border-b border-brand-primary/5 hover:bg-brand-secondary/40 transition-colors"
              >
                {/* Thumbnail */}
                <td className="px-4 py-3">
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-10 h-14 object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-10 h-14 bg-brand-primary/5 flex items-center justify-center">
                      <span className="text-[8px] text-brand-primary/20">—</span>
                    </div>
                  )}
                </td>

                {/* Name */}
                <td className="px-4 py-3 max-w-[180px]">
                  <span className="truncate block">{product.name}</span>
                </td>

                {/* Category */}
                <td className="px-4 py-3 text-brand-primary/50">{product.category}</td>

                {/* Price */}
                <td className="px-4 py-3">KES {product.price.toLocaleString()}</td>

                {/* Discounted */}
                <td className="px-4 py-3 text-brand-accent">
                  {product.discountedPrice
                    ? `KES ${product.discountedPrice.toLocaleString()}`
                    : '—'}
                </td>

                {/* Stock */}
                <td className="px-4 py-3">
                  <span
                    className={`${
                      product.stock < 5 ? 'text-brand-maroon' : 'text-brand-primary'
                    }`}
                  >
                    {product.stock}
                  </span>
                </td>

                {/* Active toggle */}
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleToggleActive(product)}
                    disabled={togglingId === product.id}
                    className={`relative w-10 h-5 transition-colors focus:outline-none disabled:opacity-50 ${
                      product.isActive ? 'bg-brand-accent' : 'bg-brand-primary/20'
                    }`}
                    aria-label="Toggle active"
                  >
                    <span
                      className={`absolute top-0.5 h-4 w-4 bg-white transition-transform ${
                        product.isActive ? 'left-5 -translate-x-1' : 'left-0.5'
                      }`}
                    />
                  </button>
                </td>

                {/* Actions */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/admin/products/${product.id}`}
                      className="p-1.5 text-brand-primary/40 hover:text-brand-primary transition-colors"
                      aria-label="Edit"
                    >
                      <Pencil size={14} />
                    </Link>
                    <button
                      onClick={() => handleDelete(product)}
                      className="p-1.5 text-brand-primary/40 hover:text-brand-maroon transition-colors"
                      aria-label="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="text-center py-16 font-serif text-lg opacity-30 italic"
                >
                  No products yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
