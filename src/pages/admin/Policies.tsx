import { useEffect, useState } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';

const Loader = () => (
  <div className="min-h-[40vh] flex items-center justify-center">
    <div className="w-10 h-10 border-2 border-brand-primary/20 border-t-brand-accent animate-spin mx-auto" />
  </div>
);

const textareaClass = 'w-full border border-brand-primary/20 px-4 py-3 text-sm leading-relaxed focus:outline-none focus:border-brand-primary bg-white rounded-none resize-y font-normal normal-case tracking-normal';
const labelClass = 'block text-[10px] uppercase tracking-widest font-bold text-brand-primary/50 mb-2';

export default function Policies() {
  const [shippingPolicy, setShippingPolicy] = useState('');
  const [returnPolicy, setReturnPolicy] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 8000); // safety fallback
    getDoc(doc(db, 'siteConfig', 'main'))
      .then(snap => {
        if (snap.exists()) {
          setShippingPolicy(snap.data().shippingPolicy ?? '');
          setReturnPolicy(snap.data().returnPolicy ?? '');
        }
      })
      .catch((err) => {
        console.error('Policies load error:', err);
        if (err?.code === 'permission-denied') {
          toast.error('Permission denied. Deploy Firestore rules first: firebase deploy --only firestore:rules');
        } else {
          toast.error('Failed to load policies.');
        }
      })
      .finally(() => { clearTimeout(timer); setLoading(false); });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'siteConfig', 'main'), {
        shippingPolicy,
        returnPolicy,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      toast.success('Policies saved.');
    } catch {
      toast.error('Failed to save policies.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="p-6 md:p-10 max-w-3xl space-y-8">
      <div className="border-b border-brand-primary/10 pb-6">
        <h1 className="text-3xl font-serif tracking-tight">Policies</h1>
        <p className="text-[10px] uppercase tracking-widest font-bold text-brand-primary/40 mt-1">
          Shipping &amp; return policies shown on the site
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className={labelClass}>Shipping Policy</label>
          <textarea
            rows={10}
            className={textareaClass}
            value={shippingPolicy}
            onChange={e => setShippingPolicy(e.target.value)}
            placeholder="Describe your shipping zones, timelines, and costs..."
          />
        </div>

        <div>
          <label className={labelClass}>Return Policy</label>
          <textarea
            rows={10}
            className={textareaClass}
            value={returnPolicy}
            onChange={e => setReturnPolicy(e.target.value)}
            placeholder="Describe your return process, conditions, and timelines..."
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="btn-luxury text-[10px] uppercase tracking-widest font-bold h-10 px-8 disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save Policies'}
      </button>
    </div>
  );
}
