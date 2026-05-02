import { Truck, RefreshCw, ShieldCheck, Clock } from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';

const DELIVERY_ZONES = [
  { zone: 'Nairobi (CBD & Suburbs)', time: '24 – 48 Hours', cost: 'Kes 300 (Free over Kes 5,000)', express: 'Same-day (orders before 2 PM)' },
  { zone: 'Countrywide (Kenya)', time: '2 – 4 Business Days', cost: 'Kes 500', express: '—' },
  { zone: 'East Africa', time: '3 – 6 Business Days', cost: 'Kes 1,200', express: '—' },
  { zone: 'International (DHL)', time: '5 – 10 Business Days', cost: 'Calculated at checkout', express: 'DHL Express available' },
];

const RETURN_STEPS = [
  { step: '01', title: 'Initiate Request', desc: 'Email hello@kaftanqueens.com with your order number and reason within 7 days of delivery.' },
  { step: '02', title: 'Receive Label', desc: 'Our team will respond within 24 hours with a prepaid return label and packing instructions.' },
  { step: '03', title: 'Ship the Item', desc: 'Pack the item in its original packaging with all tags attached and drop it at any courier point.' },
  { step: '04', title: 'Get Your Refund', desc: 'Refunds are processed within 5–7 business days of receiving your returned item.' },
];

const Shipping = () => {
  return (
    <div className="pb-32">
      <div className="container mx-auto px-4 pt-12">
        <Breadcrumbs items={[{ label: 'Shipping & Returns' }]} />
      </div>

      {/* Header */}
      <div className="container mx-auto px-4 mt-10 space-y-4">
        <p className="text-xs uppercase tracking-[0.3em] font-bold text-brand-maroon">Policies</p>
        <h1 className="text-5xl font-serif">Shipping & Returns</h1>
        <p className="text-brand-primary/55 uppercase text-[10px] tracking-widest font-medium max-w-md">
          We deliver across Kenya and internationally. Every order is handled with care by our fulfilment team in Nairobi.
        </p>
      </div>

      {/* Quick pillars */}
      <section className="bg-brand-primary text-brand-secondary mt-16 py-16">
        <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
          {[
            { icon: Truck, title: 'Fast Nairobi Delivery', sub: '24–48 hours' },
            { icon: Clock, title: 'Same-Day Express', sub: 'Orders before 2 PM' },
            { icon: RefreshCw, title: '7-Day Returns', sub: 'Hassle-free' },
            { icon: ShieldCheck, title: 'Insured Shipping', sub: 'All orders covered' },
          ].map(({ icon: Icon, title, sub }) => (
            <div key={title} className="space-y-3">
              <Icon size={28} className="text-brand-accent mx-auto" />
              <p className="text-sm font-serif">{title}</p>
              <p className="text-[9px] uppercase tracking-widest font-bold opacity-40">{sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Delivery table */}
      <section className="container mx-auto px-4 py-20 space-y-8">
        <h2 className="text-3xl font-serif">Delivery Zones & Timelines</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-brand-primary/10 text-[9px] uppercase tracking-[0.25em] font-bold text-brand-primary/40">
                <th className="py-4 pr-8">Zone</th>
                <th className="py-4 pr-8">Standard Time</th>
                <th className="py-4 pr-8">Shipping Cost</th>
                <th className="py-4">Express Option</th>
              </tr>
            </thead>
            <tbody className="text-[11px] uppercase tracking-widest font-medium">
              {DELIVERY_ZONES.map((row, i) => (
                <tr key={row.zone} className={`border-b border-brand-primary/5 ${i % 2 === 0 ? 'bg-brand-primary/2' : ''}`}>
                  <td className="py-5 pr-8 font-bold">{row.zone}</td>
                  <td className="py-5 pr-8 text-brand-accent">{row.time}</td>
                  <td className="py-5 pr-8 opacity-70">{row.cost}</td>
                  <td className="py-5 opacity-60">{row.express}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[10px] uppercase tracking-widest font-bold opacity-40">
          * Delivery times are estimates and may vary during peak seasons and public holidays.
        </p>
      </section>

      {/* Returns */}
      <section className="bg-brand-secondary border-y border-brand-primary/10 py-20">
        <div className="container mx-auto px-4 space-y-12">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] font-bold text-brand-maroon">Returns Policy</p>
            <h2 className="text-3xl font-serif">7-Day Returns — No Fuss</h2>
            <p className="text-brand-primary/60 text-sm font-light max-w-lg leading-relaxed">
              If you're not fully satisfied, we make returns straightforward. Items must be unworn, unwashed, and in original packaging with all tags attached.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {RETURN_STEPS.map(({ step, title, desc }) => (
              <div key={step} className="space-y-4">
                <p className="text-4xl font-serif text-brand-accent/40">{step}</p>
                <h3 className="font-bold uppercase tracking-widest text-xs">{title}</h3>
                <p className="text-sm text-brand-primary/55 leading-relaxed font-light">{desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-brand-primary/5 border border-brand-primary/10 p-8 space-y-3 max-w-xl">
            <p className="text-[10px] uppercase tracking-widest font-bold text-brand-primary/40">Non-Returnable Items</p>
            <ul className="text-sm text-brand-primary/65 space-y-1 list-disc list-inside font-light">
              <li>Sale and discounted items</li>
              <li>Custom or made-to-order pieces</li>
              <li>Items that have been worn, washed, or altered</li>
              <li>Items returned after the 7-day window</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Shipping;
