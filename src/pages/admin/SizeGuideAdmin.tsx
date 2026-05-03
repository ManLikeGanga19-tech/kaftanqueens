import { useEffect, useState } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SizeGuideRow } from '@/types';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';

const EMPTY_ROW: SizeGuideRow = { size: '', bust: '', waist: '', hips: '', length: '' };

const Loader = () => (
  <div className="min-h-[40vh] flex items-center justify-center">
    <div className="w-10 h-10 border-2 border-brand-primary/20 border-t-brand-accent animate-spin mx-auto" />
  </div>
);

const inputClass = 'w-full h-9 border border-brand-primary/20 px-2.5 text-sm focus:outline-none focus:border-brand-primary bg-white rounded-none';
const labelClass = 'block text-[10px] uppercase tracking-widest font-bold text-brand-primary/50 mb-1';

export default function SizeGuideAdmin() {
  const [title, setTitle] = useState('Size Guide');
  const [intro, setIntro] = useState('');
  const [rows, setRows] = useState<SizeGuideRow[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 8000);
    getDoc(doc(db, 'siteConfig', 'main'))
      .then(snap => {
        if (snap.exists() && snap.data().sizeGuide) {
          const sg = snap.data().sizeGuide;
          setTitle(sg.title ?? 'Size Guide');
          setIntro(sg.intro ?? '');
          setRows(sg.rows ?? []);
          setNotes(sg.notes ?? '');
        }
      })
      .catch((err) => {
        if (err?.code === 'permission-denied') {
          toast.error('Permission denied. Run: firebase deploy --only firestore:rules');
        } else {
          toast.error('Failed to load size guide.');
        }
      })
      .finally(() => { clearTimeout(timer); setLoading(false); });
  }, []);

  const updateRow = (i: number, field: keyof SizeGuideRow, value: string) =>
    setRows(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: value } : r));

  const addRow = () => setRows(prev => [...prev, { ...EMPTY_ROW }]);

  const removeRow = (i: number) => setRows(prev => prev.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'siteConfig', 'main'), {
        sizeGuide: { title, intro, rows, notes },
        updatedAt: serverTimestamp(),
      }, { merge: true });
      toast.success('Size guide saved.');
    } catch {
      toast.error('Failed to save size guide.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  const COLS: (keyof SizeGuideRow)[] = ['size', 'bust', 'waist', 'hips', 'length'];

  return (
    <div className="p-6 md:p-10 max-w-4xl space-y-8">
      <div className="border-b border-brand-primary/10 pb-6">
        <h1 className="text-3xl font-serif tracking-tight">Size Guide</h1>
        <p className="text-[10px] uppercase tracking-widest font-bold text-brand-primary/40 mt-1">
          Manage the size chart displayed on the site
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className={labelClass}>Title</label>
          <input className={inputClass} value={title} onChange={e => setTitle(e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Intro Text</label>
          <textarea
            rows={3}
            className="w-full border border-brand-primary/20 px-3 py-2 text-sm focus:outline-none focus:border-brand-primary bg-white rounded-none resize-y normal-case font-normal tracking-normal"
            value={intro}
            onChange={e => setIntro(e.target.value)}
            placeholder="Brief sizing instructions shown above the table"
          />
        </div>
      </div>

      {/* Size table editor */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className={labelClass + ' mb-0'}>Size Rows</p>
          <button
            onClick={addRow}
            className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold text-brand-accent hover:text-brand-primary transition-colors"
          >
            <Plus size={13} />
            Add Row
          </button>
        </div>

        <div className="overflow-x-auto border border-brand-primary/10">
          <table className="w-full">
            <thead>
              <tr className="bg-brand-primary text-brand-secondary text-[9px] uppercase tracking-[0.2em] font-bold">
                {COLS.map(c => <th key={c} className="px-3 py-2 text-left">{c}</th>)}
                <th className="px-3 py-2 w-10" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-b border-brand-primary/5">
                  {COLS.map(col => (
                    <td key={col} className="px-2 py-1.5">
                      <input
                        className="w-full h-8 border border-brand-primary/15 px-2 text-sm focus:outline-none focus:border-brand-primary bg-white rounded-none normal-case font-normal tracking-normal"
                        value={row[col]}
                        onChange={e => updateRow(i, col, e.target.value)}
                        placeholder={col}
                      />
                    </td>
                  ))}
                  <td className="px-2 py-1.5">
                    <button onClick={() => removeRow(i)} className="text-brand-primary/30 hover:text-brand-maroon transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 font-serif text-sm opacity-30 italic">
                    No rows yet — click Add Row
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <label className={labelClass}>Notes / Footer</label>
        <textarea
          rows={2}
          className="w-full border border-brand-primary/20 px-3 py-2 text-sm focus:outline-none focus:border-brand-primary bg-white rounded-none resize-y normal-case font-normal tracking-normal"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="e.g. All measurements are in centimetres. When in doubt, size up."
        />
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="btn-luxury text-[10px] uppercase tracking-widest font-bold h-10 px-8 disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save Size Guide'}
      </button>
    </div>
  );
}
