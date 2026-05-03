import { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CategoryDoc } from '@/types';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';

const Loader = () => (
  <div className="min-h-[40vh] flex items-center justify-center">
    <div className="space-y-4 text-center">
      <div className="w-10 h-10 border-2 border-brand-primary/20 border-t-brand-accent animate-spin mx-auto" />
      <p className="text-[10px] uppercase tracking-widest font-bold text-brand-primary/40">Loading</p>
    </div>
  </div>
);

function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

type NewCatForm = {
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
  sortOrder: string;
};

const EMPTY_NEW: NewCatForm = {
  name: '',
  slug: '',
  description: '',
  isActive: true,
  sortOrder: '1',
};

export default function Categories() {
  const [categories, setCategories] = useState<CategoryDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newForm, setNewForm] = useState<NewCatForm>(EMPTY_NEW);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [editingSort, setEditingSort] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<NewCatForm>>({});

  const fetchCategories = async () => {
    try {
      const snap = await getDocs(
        query(collection(db, 'categories'), orderBy('sortOrder', 'asc'))
      );
      setCategories(snap.docs.map(d => ({ id: d.id, ...d.data() } as CategoryDoc)));
    } catch {
      toast.error('Failed to load categories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleNameChange = (value: string) => {
    setNewForm(prev => ({ ...prev, name: value, slug: slugify(value) }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.name.trim()) { toast.error('Name is required.'); return; }
    setSaving(true);
    try {
      await addDoc(collection(db, 'categories'), {
        name: newForm.name.trim(),
        slug: newForm.slug.trim() || slugify(newForm.name),
        description: newForm.description.trim(),
        isActive: newForm.isActive,
        sortOrder: Number(newForm.sortOrder) || 1,
        createdAt: serverTimestamp(),
      });
      toast.success('Category created.');
      setNewForm(EMPTY_NEW);
      setShowForm(false);
      fetchCategories();
    } catch {
      toast.error('Failed to create category.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (cat: CategoryDoc) => {
    setTogglingId(cat.id);
    try {
      await updateDoc(doc(db, 'categories', cat.id), { isActive: !cat.isActive });
      setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, isActive: !c.isActive } : c));
    } catch {
      toast.error('Failed to update.');
    } finally {
      setTogglingId(null);
    }
  };

  const handleSortBlur = async (cat: CategoryDoc) => {
    const raw = editingSort[cat.id];
    if (raw == null) return;
    const val = Number(raw);
    if (isNaN(val)) { setEditingSort(prev => { const n = { ...prev }; delete n[cat.id]; return n; }); return; }
    try {
      await updateDoc(doc(db, 'categories', cat.id), { sortOrder: val });
      setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, sortOrder: val } : c).sort((a, b) => a.sortOrder - b.sortOrder));
    } catch {
      toast.error('Failed to update sort order.');
    }
    setEditingSort(prev => { const n = { ...prev }; delete n[cat.id]; return n; });
  };

  const startEdit = (cat: CategoryDoc) => {
    setEditingId(cat.id);
    setEditForm({ name: cat.name, slug: cat.slug, description: cat.description, isActive: cat.isActive });
  };

  const handleEditSave = async (cat: CategoryDoc) => {
    setSaving(true);
    try {
      const update = {
        name: (editForm.name ?? cat.name).trim(),
        slug: (editForm.slug ?? cat.slug).trim(),
        description: (editForm.description ?? cat.description ?? '').trim(),
        isActive: editForm.isActive ?? cat.isActive,
      };
      await updateDoc(doc(db, 'categories', cat.id), update);
      setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, ...update } : c));
      toast.success('Category updated.');
      setEditingId(null);
    } catch {
      toast.error('Failed to update category.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat: CategoryDoc) => {
    if (!window.confirm(`Delete "${cat.name}"?`)) return;
    try {
      await deleteDoc(doc(db, 'categories', cat.id));
      setCategories(prev => prev.filter(c => c.id !== cat.id));
      toast.success('Category deleted.');
    } catch {
      toast.error('Failed to delete category.');
    }
  };

  if (loading) return <Loader />;

  const inputClass = 'h-8 border border-brand-primary/20 px-2.5 text-sm focus:outline-none focus:border-brand-primary bg-white rounded-none w-full';
  const labelClass = 'block text-[10px] uppercase tracking-widest font-bold text-brand-primary/50 mb-1';

  return (
    <div className="p-6 md:p-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-brand-primary/10 pb-6">
        <div>
          <h1 className="text-3xl font-serif tracking-tight">Categories</h1>
          <p className="text-[10px] uppercase tracking-widest font-bold text-brand-primary/40 mt-1">
            {categories.length} total
          </p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="btn-luxury inline-flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold h-10 px-5"
        >
          <Plus size={14} />
          Add Category
        </button>
      </div>

      {/* Inline create form */}
      {showForm && (
        <div className="border border-brand-primary/10 p-6 bg-brand-secondary/40 space-y-4">
          <p className="text-[10px] uppercase tracking-widest font-bold text-brand-primary/50">
            New Category
          </p>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Name *</label>
              <input
                className={inputClass}
                value={newForm.name}
                onChange={e => handleNameChange(e.target.value)}
                placeholder="e.g. Traditional"
                required
              />
            </div>
            <div>
              <label className={labelClass}>Slug</label>
              <input
                className={inputClass}
                value={newForm.slug}
                onChange={e => setNewForm(p => ({ ...p, slug: e.target.value }))}
                placeholder="auto-generated from name"
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Description</label>
              <input
                className={inputClass}
                value={newForm.description}
                onChange={e => setNewForm(p => ({ ...p, description: e.target.value }))}
                placeholder="Optional"
              />
            </div>
            <div>
              <label className={labelClass}>Sort Order</label>
              <input
                className={inputClass}
                type="number"
                value={newForm.sortOrder}
                onChange={e => setNewForm(p => ({ ...p, sortOrder: e.target.value }))}
              />
            </div>
            <div className="flex items-end gap-4">
              <button
                type="submit"
                disabled={saving}
                className="btn-luxury text-[10px] uppercase tracking-widest font-bold h-9 px-6 disabled:opacity-50"
              >
                {saving ? 'Creating...' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setNewForm(EMPTY_NEW); }}
                className="h-9 px-4 border border-brand-primary/20 text-[10px] uppercase tracking-widest font-bold text-brand-primary/50 hover:text-brand-primary transition-colors"
              >
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
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Slug</th>
              <th className="px-5 py-3">Description</th>
              <th className="px-5 py-3">Sort</th>
              <th className="px-5 py-3">Active</th>
              <th className="px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="text-[10px] uppercase tracking-widest font-bold">
            {categories.map(cat => (
              <tr
                key={cat.id}
                className="border-b border-brand-primary/5 hover:bg-brand-secondary/40 transition-colors"
              >
                <td className="px-5 py-3">
                  {editingId === cat.id ? (
                    <input
                      className={inputClass}
                      value={editForm.name ?? cat.name}
                      onChange={e => {
                        const name = e.target.value;
                        setEditForm(p => ({ ...p, name, slug: slugify(name) }));
                      }}
                    />
                  ) : (
                    cat.name
                  )}
                </td>
                <td className="px-5 py-3 text-brand-primary/50 font-mono text-[9px]">
                  {editingId === cat.id ? (
                    <input
                      className={inputClass}
                      value={editForm.slug ?? cat.slug}
                      onChange={e => setEditForm(p => ({ ...p, slug: e.target.value }))}
                    />
                  ) : (
                    cat.slug
                  )}
                </td>
                <td className="px-5 py-3 text-brand-primary/40 normal-case font-normal text-[10px]">
                  {editingId === cat.id ? (
                    <input
                      className={inputClass}
                      value={editForm.description ?? cat.description ?? ''}
                      onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))}
                    />
                  ) : (
                    cat.description || '—'
                  )}
                </td>
                <td className="px-5 py-3">
                  <input
                    type="number"
                    className="w-14 h-7 border border-brand-primary/20 px-2 text-xs text-center focus:outline-none focus:border-brand-primary bg-white rounded-none"
                    value={editingSort[cat.id] ?? String(cat.sortOrder)}
                    onChange={e => setEditingSort(prev => ({ ...prev, [cat.id]: e.target.value }))}
                    onBlur={() => handleSortBlur(cat)}
                  />
                </td>
                <td className="px-5 py-3">
                  <button
                    onClick={() => handleToggleActive(cat)}
                    disabled={togglingId === cat.id}
                    className={`relative w-10 h-5 transition-colors focus:outline-none disabled:opacity-50 ${
                      cat.isActive ? 'bg-brand-accent' : 'bg-brand-primary/20'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-4 w-4 bg-white transition-transform ${
                        cat.isActive ? 'left-5 -translate-x-1' : 'left-0.5'
                      }`}
                    />
                  </button>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    {editingId === cat.id ? (
                      <>
                        <button
                          onClick={() => handleEditSave(cat)}
                          disabled={saving}
                          className="p-1.5 text-green-600 hover:text-green-700 transition-colors"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1.5 text-brand-primary/40 hover:text-brand-primary transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(cat)}
                          className="p-1.5 text-brand-primary/40 hover:text-brand-primary transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(cat)}
                          className="p-1.5 text-brand-primary/40 hover:text-brand-maroon transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-16 font-serif text-lg opacity-30 italic">
                  No categories yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
