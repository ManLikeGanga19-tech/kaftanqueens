import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Breadcrumbs from '../components/Breadcrumbs';

const FAQS = [
  {
    category: 'Orders & Payment',
    items: [
      {
        q: 'What payment methods do you accept?',
        a: 'We accept M-Pesa (STK Push), Visa, and Mastercard. M-Pesa is our recommended payment method for Kenyan customers for the fastest checkout experience.',
      },
      {
        q: 'How does M-Pesa STK Push work?',
        a: 'At checkout, enter your Safaricom number and click "Initiate M-Pesa Prompt". You will receive a push notification on your phone — enter your M-Pesa PIN to complete payment. The process takes under 30 seconds.',
      },
      {
        q: 'Can I modify or cancel my order after placing it?',
        a: 'Orders can be modified or cancelled within 2 hours of placement. Contact us immediately at hello@kaftanqueens.com or WhatsApp +254 700 000 000. Once the order enters processing, changes may not be possible.',
      },
      {
        q: 'Do I need an account to place an order?',
        a: 'You need an account to complete a purchase. Signing in takes under 30 seconds with Google or Facebook. Your account also lets you track orders, manage your wishlist, and enjoy faster future checkouts.',
      },
    ],
  },
  {
    category: 'Delivery & Shipping',
    items: [
      {
        q: 'How long does delivery take?',
        a: 'Nairobi deliveries: 24–48 hours. Countrywide: 2–4 business days. International (via DHL Express): 5–10 business days. Express same-day delivery is available for Nairobi orders placed before 2 PM.',
      },
      {
        q: 'Do you deliver outside Kenya?',
        a: 'Yes! We ship internationally via DHL Express. International shipping fees are calculated at checkout based on destination. Duties and taxes may apply and are the customer\'s responsibility.',
      },
      {
        q: 'How do I track my order?',
        a: 'Once your order ships, you will receive a tracking number via email and SMS. You can also log in to your account and visit "My Orders" to see real-time delivery status.',
      },
    ],
  },
  {
    category: 'Returns & Exchanges',
    items: [
      {
        q: 'What is your return policy?',
        a: 'We offer a 7-day return window from the date of delivery. Items must be unworn, unwashed, and in original packaging with all tags attached. Sale items and custom orders are non-returnable.',
      },
      {
        q: 'How do I initiate a return?',
        a: 'Email hello@kaftanqueens.com with your order number and reason for return. Our team will respond within 24 hours with a return label and instructions. Refunds are processed within 5–7 business days of receiving the item.',
      },
      {
        q: 'Can I exchange for a different size or colour?',
        a: 'Yes, exchanges are available subject to stock availability. Contact us within 7 days of delivery. If your preferred exchange item is out of stock, we will issue a full store credit.',
      },
    ],
  },
  {
    category: 'Products & Sizing',
    items: [
      {
        q: 'How do I find my size?',
        a: 'Most of our kaftans are "One Size Fits Most" and are designed to be flowing and generous in fit. For structured pieces (S/M/L), refer to our Size Guide page for detailed measurements.',
      },
      {
        q: 'How do I care for my kaftan?',
        a: 'Silk and velvet pieces should be dry-cleaned only. Cotton kaftans can be hand-washed in cold water. Do not bleach. Steam iron on low heat to preserve embroidery. Full care instructions are on each product\'s label.',
      },
      {
        q: 'Are the colours accurate in the photos?',
        a: 'We photograph all pieces under natural light to represent colours as accurately as possible. Minor variations may occur due to screen calibration differences. If you have any concerns about a specific colour, contact us before purchasing.',
      },
    ],
  },
];

const FAQItem = ({ q, a }: { q: string; a: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-brand-primary/10">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-start py-5 text-left gap-8"
      >
        <span className="text-sm font-medium uppercase tracking-wide">{q}</span>
        <span className="shrink-0 mt-0.5 text-brand-accent">
          {open ? <Minus size={16} /> : <Plus size={16} />}
        </span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-sm text-brand-primary/65 leading-relaxed font-light max-w-2xl">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FAQ = () => {
  return (
    <div className="container mx-auto px-4 py-16 pb-32 max-w-3xl">
      <Breadcrumbs items={[{ label: 'FAQs' }]} />

      <div className="mt-10 space-y-4">
        <p className="text-xs uppercase tracking-[0.3em] font-bold text-brand-maroon">Support</p>
        <h1 className="text-5xl font-serif">Frequently Asked<br />Questions</h1>
        <p className="text-brand-primary/55 uppercase text-[10px] tracking-widest font-medium max-w-md">
          Everything you need to know about ordering, delivery, and caring for your Kaftan Queens pieces.
        </p>
      </div>

      <div className="mt-16 space-y-14">
        {FAQS.map(({ category, items }) => (
          <section key={category} className="space-y-0">
            <h2 className="text-[10px] uppercase tracking-[0.3em] font-bold text-brand-accent mb-4 pb-4 border-b-2 border-brand-accent/20">
              {category}
            </h2>
            {items.map(item => (
              <FAQItem key={item.q} {...item} />
            ))}
          </section>
        ))}
      </div>

      <div className="mt-16 bg-brand-primary text-brand-secondary p-10 space-y-4">
        <h3 className="text-xl font-serif">Still have questions?</h3>
        <p className="text-[10px] uppercase tracking-widest font-bold opacity-50">Our team is here to help — 7 days a week.</p>
        <div className="flex flex-col sm:flex-row gap-4 pt-2 text-[10px] uppercase tracking-widest font-bold">
          <a href="mailto:hello@kaftanqueens.com" className="text-brand-accent hover:underline">hello@kaftanqueens.com</a>
          <span className="opacity-30 hidden sm:inline">·</span>
          <a href="https://wa.me/254700000000" className="text-brand-accent hover:underline">WhatsApp +254 700 000 000</a>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
