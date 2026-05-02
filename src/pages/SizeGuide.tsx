import React, { useState } from 'react';
import Breadcrumbs from '../components/Breadcrumbs';

type Unit = 'cm' | 'inches';

const SIZES = [
  { size: 'XS / 6',  chest: 82,  waist: 63,  hips: 88,  length: 140 },
  { size: 'S / 8',   chest: 86,  waist: 67,  hips: 92,  length: 142 },
  { size: 'M / 10',  chest: 90,  waist: 71,  hips: 96,  length: 144 },
  { size: 'L / 12',  chest: 94,  waist: 75,  hips: 100, length: 146 },
  { size: 'XL / 14', chest: 100, waist: 81,  hips: 106, length: 148 },
  { size: 'XXL / 16',chest: 106, waist: 87,  hips: 112, length: 150 },
];

const toInches = (cm: number) => (cm / 2.54).toFixed(1);

const TIPS = [
  { label: 'Chest', desc: 'Measure around the fullest part of your chest, keeping the tape parallel to the floor.' },
  { label: 'Waist', desc: 'Measure around your natural waistline — the narrowest part of your torso.' },
  { label: 'Hips', desc: 'Measure around the fullest part of your hips, approximately 20 cm below your waist.' },
  { label: 'Length', desc: 'Measured from the shoulder seam to the hem of the garment.' },
];

const SizeGuide = () => {
  const [unit, setUnit] = useState<Unit>('cm');

  const fmt = (val: number) => unit === 'cm' ? `${val}` : toInches(val);

  return (
    <div className="container mx-auto px-4 py-16 pb-32 max-w-4xl">
      <Breadcrumbs items={[{ label: 'Size Guide' }]} />

      <div className="mt-10 space-y-4">
        <p className="text-xs uppercase tracking-[0.3em] font-bold text-brand-maroon">Fit Guide</p>
        <h1 className="text-5xl font-serif">Size Guide</h1>
        <p className="text-brand-primary/55 uppercase text-[10px] tracking-widest font-medium max-w-md">
          All measurements are in {unit}. Most of our kaftans are "One Size Fits Most" — generously cut and designed to drape beautifully.
        </p>
      </div>

      {/* Unit toggle */}
      <div className="mt-10 flex items-center gap-0 border border-brand-primary/15 w-fit">
        {(['cm', 'inches'] as Unit[]).map(u => (
          <button
            key={u}
            onClick={() => setUnit(u)}
            className={`px-6 py-2.5 text-[10px] uppercase tracking-widest font-bold transition-colors ${
              unit === u
                ? 'bg-brand-primary text-brand-secondary'
                : 'bg-transparent text-brand-primary/50 hover:text-brand-primary'
            }`}
          >
            {u}
          </button>
        ))}
      </div>

      {/* Size table */}
      <div className="mt-8 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-brand-primary text-brand-secondary text-[9px] uppercase tracking-[0.25em] font-bold">
              <th className="px-6 py-4">Size</th>
              <th className="px-6 py-4">Chest ({unit})</th>
              <th className="px-6 py-4">Waist ({unit})</th>
              <th className="px-6 py-4">Hips ({unit})</th>
              <th className="px-6 py-4">Length ({unit})</th>
            </tr>
          </thead>
          <tbody className="text-[11px] uppercase tracking-widest font-medium">
            {SIZES.map((row, i) => (
              <tr key={row.size} className={`border-b border-brand-primary/5 ${i % 2 === 0 ? 'bg-brand-primary/3' : 'bg-white'}`}>
                <td className="px-6 py-4 font-bold text-brand-accent">{row.size}</td>
                <td className="px-6 py-4">{fmt(row.chest)}</td>
                <td className="px-6 py-4">{fmt(row.waist)}</td>
                <td className="px-6 py-4">{fmt(row.hips)}</td>
                <td className="px-6 py-4">{fmt(row.length)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* One Size note */}
      <div className="mt-4 bg-brand-accent/10 border border-brand-accent/20 p-5 flex items-start gap-4">
        <div className="w-1 self-stretch bg-brand-accent shrink-0" />
        <p className="text-[11px] uppercase tracking-widest font-bold text-brand-primary/70">
          "One Size" garments are designed to fit UK sizes 8–18. The flowing cut accommodates a wide range of body types. If you are between sizes, we recommend sizing up.
        </p>
      </div>

      {/* How to measure */}
      <section className="mt-16 space-y-8">
        <h2 className="text-2xl font-serif">How to Measure</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {TIPS.map(({ label, desc }) => (
            <div key={label} className="border border-brand-primary/10 p-6 space-y-2">
              <p className="text-[10px] uppercase tracking-widest font-bold text-brand-accent">{label}</p>
              <p className="text-sm text-brand-primary/65 font-light leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <div className="mt-12 bg-brand-primary text-brand-secondary p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <p className="text-sm font-serif">Not sure about your size?</p>
          <p className="text-[10px] uppercase tracking-widest font-bold opacity-40">Our stylists are happy to help.</p>
        </div>
        <a
          href="https://wa.me/254700000000"
          className="text-[10px] uppercase tracking-widest font-bold text-brand-accent hover:underline whitespace-nowrap"
        >
          Chat on WhatsApp →
        </a>
      </div>
    </div>
  );
};

export default SizeGuide;
