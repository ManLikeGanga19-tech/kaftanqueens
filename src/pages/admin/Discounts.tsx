import { useEffect, useState } from 'react';
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc,
  doc, serverTimestamp, query, orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Discount } from '@/types';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';

const Loader = () => (
  <div className="min-h-[40vh] flex items-center justify-center">
    <div className="w-10 h-10 border-2 border-brand-primary/20 border-t-brand-accent animate-spin mx-auto" />
  </div>
);

type NewForm = {
  code: string;
  type: 'percentage' | 'fixed';
  value: string;
  minOrder: string;
  maxUses: string;
  expiresAt: string;
  isActive: boolean;
};

const EMPTY: NewForm = {
  code: '', type: 'percentage', value: '', minOrder: '', maxUses: '', expiresAt: '', isActive: true,
};

const inputClass = 'w-full h-9 border border-brand-primary/20 px-2.5 text-sm focus:outline-none focus:border-brand-primary bg-white rounded-none';
const labelClass = 'block text-[10px] uppercase tracking-widest font-bold text-brand-primary/50 mb-1';

export default function Discounts() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<NewForm>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchDiscounts = () => {
    getDocs(query(collection(db, 'discounts'), orderBy('createdAt', 'desc')))
      .then(snap => setDiscounts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Discount))))
      .catch(() => toast.error('Failed to load discounts.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDiscounts(); }, []);

  const set = <K extends keyof NewForm>(k: K, v: NewForm[K]) =>
    setForm(prev => ({ ...prev, [k]: v }));

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim() || !form.value) { toast.error('Code and value are required.'); return; }
    setSaving(true);
    try {
      await addDoc(collection(db, 'discounts'), {
        code: form.code.trim().toUpperCase(),
        type: form.type,
        value: Number(form.value),
        minOrder: form.minOrder ? Number(form.minOrder) : null,
        maxUses: form.maxUses ? Number(form.maxUses) : null,
        usedCount: 0,
        isActive: form.isActive,
        expiresAt: form.expiresAt ? new Date(form.expiresAt) : null,
        createdAt: serverTimestamp(),
      });
      toast.success('Discount created.');
      setForm(EMPTY);
      setShowForm(false);
      fetchDiscounts();
    } catch {
      toast.error('Failed to create discount.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (d: Discount) => {
    setTogglingId(d.id);
    try {
      await updateDoc(doc(db, 'discounts', d.id), { isActive: !d.isActive });
      setDiscounts(prev => prev.map(x => x.id === d.id ? { ...x, isActive: !x.isActive } : x));
    } catch {
      toast.error('Failed to update discount.');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (d: Discount) => {
    if (!window.confirm(`Delete discount "${d.code}"?`)) return;
    try {
      await deleteDoc(doc(db, 'discounts', d.id));
      setDiscounts(prev => prev.filter(x => x.id !== d.id));
      toast.success('Discount deleted.');
    } catch {
      toast.error('Failed to delete discount.');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="p-6 md:p-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-brand-primary/10 pb-6">
        <div>
          <h1 className="text-3xl font-serif tracking-tight">Discounts</h1>
          <p className="text-[10px] uppercase tracking-widest font-bold text-brand-primary/40 mt-1">
            {discounts.length} codes
          </p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="btn-luxury inline-flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold h-10 px-5"
        >
          <Plus size={14} />
          Create Discount
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="border border-brand-primary/10 p-6 bg-brand-secondary/40 space-y-4">
          <p className={labelClass + ' text-brand-primary/70'}>New Discount Code</p>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Code *</label>
              <input className={inputClass} value={form.code} onChange={e => set('code', e.target.value.toUpperCase())} placeholder="SUMMER20" required />
            </div>
            <div>
              <label className={labelClass}>Type</label>
              <select className={inputClass} value={form.type} onChange={e => set('type', e.target.value as 'percentage' | 'fixed')}>
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (KES)</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Value *</label>
              <input className={inputClass} type="number" min="0" value={form.value} onChange={e => set('value', e.target.value)} placeholder={form.type === 'percentage' ? '20' : '500'} required />
            </div>
            <div>
              <label className={labelClass}>Min Order (KES)</label>
              <input className={inputClass} type="number" min="0" value={form.minOrder} onChange={e => set('minOrder', e.target.value)} placeholder="Optional" />
            </div>
            <div>
              <label className={labelClass}>Max Uses</label>
              <input className={inputClass} type="number" min="0" value={form.maxUses} onChange={e => set('maxUses', e.target.value)} placeholder="Unlimited" />
            </div>
            <div>
              <label className={labelClass}>Expires At</label>
              <input className={inputClass} type="date" value={form.expiresAt} onChange={e => set('expiresAt', e.target.value)} />
            </div>
            <div className="sm:col-span-3 flex items-center gap-4">
              <button type="submit" disabled={saving} className="btn-luxury text-[10px] uppercase tracking-widest font-bold h-9 px-6 disabled:opacity-50">
                {saving ? 'Creating...' : 'Create'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setForm(EMPTY); }} className="h-9 px-4 border border-brand-primary/20 text-[10px] uppercase tracking-widest font-bold text-brand-primary/50 hover:text-brand-primary transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto border border-brand-primary/10">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-brand-primary text-brand-secondary text-[9px] uppercase tracking-[0.2em] font-bold">
              <th className="px-5 py-3">Code</th>
              <th className="px-5 py-3">Type</th>
              <th className="px-5 py-3">Value</th>
              <th className="px-5 py-3">Min Order</th>
              <th className="px-5 py-3">Uses</th>
              <th className="px-5 py-3">Expires</th>
              <th className="px-5 py-3">Active</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="text-[10px] uppercase tracking-widest font-bold">
            {discounts.map(d => (
              <tr key={d.id} className="border-b border-brand-primary/5 hover:bg-brand-secondary/40 transition-colors">
                <td className="px-5 py-3 font-mono tracking-widest text-brand-accent">{d.code}</td>
                <td className="px-5 py-3 text-brand-primary/50">{d.type}</td>
                <td className="px-5 py-3">{d.type === 'percentage' ? `${d.value}%` : `KES ${d.value.toLocaleString()}`}</td>
                <td className="px-5 py-3 text-brand-primary/50">{d.minOrder ? `KES ${d.minOrder.toLocaleString()}` : '—'}</td>
                <td className="px-5 py-3">{d.usedCount}{d.maxUses ? ` / ${d.maxUses}` : ''}</td>
                <td className="px-5 py-3 text-brand-primary/40">
                  {d.expiresAt?.toDate ? d.expiresAt.toDate().toLocaleDateString('en-KE') : '—'}
                </td>
                <td className="px-5 py-3">
                  <button
                    onClick={() => handleToggle(d)}
                    disabled={togglingId === d.id}
                    className={`relative w-10 h-5 transition-colors focus:outline-none disabled:opacity-50 ${d.isActive ? 'bg-brand-accent' : 'bg-brand-primary/20'}`}
                  >
                    <span className={`absolute top-0.5 h-4 w-4 bg-white transition-transform ${d.isActive ? 'left-5 -translate-x-1' : 'left-0.5'}`} />
                  </button>
                </td>
                <td className="px-5 py-3">
                  <button onClick={() => handleDelete(d)} className="p-1.5 text-brand-primary/30 hover:text-brand-maroon transition-colors">
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {discounts.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-16 font-serif text-lg opacity-30 italic">No discount codes yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
