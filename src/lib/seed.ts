import { collection, addDoc, setDoc, doc, getDocs, serverTimestamp, limit, query } from 'firebase/firestore';
import { db } from './firebase';

const PRODUCTS = [
  {
    name: 'Luxury Zari Silk Dera',
    description: 'Flowing silk dera with intricate gold zari embroidery along the neckline and sleeves. Perfect for high-end traditional events.',
    narrative: 'This exquisite silk dera is a masterpiece of Kenyan craftsmanship. Featuring hand-woven gold zari embroidery on ethically sourced raw silk, it embodies the perfect blend of heritage and luxury. The flowing silhouette ensures comfort without compromising on elegance, making it an ideal choice for weddings, traditional ceremonies, or upscale evening events. Each piece takes our artisans in Nairobi over 40 hours to complete.',
    shippingCare: 'Dry clean only. Do not bleach. Steam iron on low heat to maintain the silk\'s integrity and embroidery luster. Store folded in the provided dust bag.',
    category: 'traditional',
    price: 15000,
    stock: 3,
    rating: 4.9,
    reviewsCount: 15,
    colors: [{ name: 'Gold', hex: '#C5A059' }, { name: 'Midnight Black', hex: '#1A1A1A' }],
    sizes: ['One Size'],
    images: ['https://images.unsplash.com/photo-1620331311520-246422fd82f9?q=80&w=800&auto=format&fit=crop'],
    currencies: { USD: 120, EUR: 110 },
    isActive: true,
  },
  {
    name: 'Coastal Breeze Cotton Kaftan',
    description: 'Lightweight, breathable cotton kaftan featuring traditional Swahili print patterns. Ideal for the Kenyan coast and everyday elegant lounging.',
    narrative: 'Born from the vibrant culture of Kenya\'s coastline, this cotton kaftan captures the essence of Swahili artistry. The hand-block-printed fabric is sourced from a women\'s cooperative in Mombasa, ensuring that every purchase supports local artisans. Lightweight and breathable, it transitions seamlessly from a beach morning to an evening dinner.',
    shippingCare: 'Machine wash cold on gentle cycle. Lay flat to dry. Do not tumble dry. Iron on medium heat.',
    category: 'traditional',
    price: 8000,
    stock: 12,
    rating: 4.7,
    reviewsCount: 22,
    colors: [{ name: 'Ocean Blue', hex: '#2E6EA6' }, { name: 'White', hex: '#F5F2ED' }],
    sizes: ['One Size'],
    images: ['https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?q=80&w=800&auto=format&fit=crop'],
    currencies: { USD: 55, EUR: 50 },
    isActive: true,
  },
  {
    name: 'Modern Minimalist Linen Dera',
    description: 'A contemporary take on the dera. Clean lines, hidden pockets, and premium Belgian linen for the modern Kenyan woman.',
    narrative: 'The Modern Minimalist Linen Dera is our answer to the contemporary woman who refuses to choose between heritage and modern design. Cut from premium Belgian linen, it features concealed side pockets, a structured collar, and subtle tonal embroidery at the cuffs. The relaxed silhouette works effortlessly from boardroom to dinner table.',
    shippingCare: 'Hand wash or machine wash cold. Do not bleach. Hang to dry. Iron on medium heat while slightly damp for best results.',
    category: 'modern',
    price: 11000,
    stock: 8,
    rating: 4.8,
    reviewsCount: 10,
    colors: [{ name: 'Sage', hex: '#8FAE8B' }, { name: 'Sand', hex: '#C8B89A' }, { name: 'Rose', hex: '#D4888A' }],
    sizes: ['S', 'M', 'L'],
    images: ['https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=800&auto=format&fit=crop'],
    currencies: { USD: 75, EUR: 70 },
    isActive: true,
  },
  {
    name: 'Royal Emerald Velvet Kaftan',
    description: 'Heavy velvet kaftan with hand-stitched crystal detailing. An opulent piece for weddings and grand celebrations.',
    narrative: 'The Royal Emerald Velvet Kaftan is the crown jewel of our collection. Crafted from the finest Italian velvet and adorned with over 200 individually hand-stitched Swarovski-inspired crystals, this piece commands every room it enters. Designed for the queen who refuses to be ordinary, it is the ultimate statement for weddings, galas, and milestone celebrations. Limited to 10 pieces per season.',
    shippingCare: 'Dry clean only. Store on a wide padded hanger. Keep away from direct sunlight to preserve the velvet pile and crystal brilliance.',
    category: 'traditional',
    price: 25000,
    stock: 2,
    rating: 5.0,
    reviewsCount: 5,
    colors: [{ name: 'Emerald', hex: '#1D6A4A' }],
    sizes: ['M', 'L'],
    images: ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop'],
    currencies: { USD: 170, EUR: 160 },
    isActive: true,
  },
];

const CATEGORIES = [
  { name: 'Traditional', slug: 'traditional', description: 'Heritage kaftans rooted in Kenyan tradition', isActive: true, sortOrder: 1 },
  { name: 'Modern', slug: 'modern', description: 'Contemporary designs for the modern queen', isActive: true, sortOrder: 2 },
];

const SITE_CONFIG = {
  shippingPolicy: `SHIPPING POLICY — KAFTAN QUEENS

We deliver across Kenya and internationally. All orders are carefully packaged by our fulfilment team in Nairobi.

DELIVERY ZONES & TIMELINES

Nairobi (CBD & Suburbs)
Standard: 24–48 hours (KES 300, free on orders over KES 5,000)
Same-day Express: Available for orders placed before 2:00 PM

Countrywide (Kenya)
Standard: 2–4 Business Days (KES 500)

East Africa (Uganda, Tanzania, Rwanda)
Standard: 3–6 Business Days (KES 1,200)

International (DHL Express)
Standard: 5–10 Business Days (calculated at checkout)
DHL Express available at additional cost

All orders are tracked and you will receive an SMS and email with your tracking number once dispatched. Delivery times are estimates and may vary during peak seasons and public holidays.`,

  returnPolicy: `RETURN & EXCHANGE POLICY — KAFTAN QUEENS

We want you to love every piece. If you are not completely satisfied, we offer a 7-day return and exchange policy.

HOW TO INITIATE A RETURN

1. Email hello@kaftanqueens.com with your order number and reason for return within 7 days of delivery.
2. Our team will respond within 24 hours with a prepaid return label and packing instructions.
3. Pack the item in its original packaging with all tags attached.
4. Drop it at any DHL or G4S courier point near you.
5. Refunds are processed within 5–7 business days of receiving your returned item.

ELIGIBLE ITEMS FOR RETURN

Items must be unworn, unwashed, and in original condition with all tags attached.

NON-RETURNABLE ITEMS

- Sale and discounted items
- Custom or made-to-order pieces
- Items that have been worn, washed, or altered
- Items returned after the 7-day window

EXCHANGES

We offer exchanges for different sizes or colours subject to availability. Follow the same process as returns and indicate your preferred exchange in the email.`,

  sizeGuide: {
    title: 'Size Guide',
    intro: 'All measurements are in centimetres (cm). We recommend measuring yourself or a well-fitting garment for the most accurate size. When between sizes, we suggest sizing up for a more comfortable fit.',
    rows: [
      { size: 'XS', bust: '80–84', waist: '62–66', hips: '88–92', length: '130' },
      { size: 'S',  bust: '84–88', waist: '66–70', hips: '92–96', length: '132' },
      { size: 'M',  bust: '88–94', waist: '70–76', hips: '96–102', length: '134' },
      { size: 'L',  bust: '94–100', waist: '76–82', hips: '102–108', length: '136' },
      { size: 'XL', bust: '100–108', waist: '82–90', hips: '108–116', length: '138' },
      { size: 'One Size', bust: '80–108', waist: '60–90', hips: '88–116', length: '132–138' },
    ],
    notes: 'All measurements are in centimetres. When in doubt, size up. Custom sizing is available on selected pieces — email hello@kaftanqueens.com.',
  },
};

export async function seedFirestore(): Promise<string> {
  const results: string[] = [];

  // Check if products already exist
  const existingProducts = await getDocs(query(collection(db, 'products'), limit(1)));
  if (existingProducts.empty) {
    for (const product of PRODUCTS) {
      await addDoc(collection(db, 'products'), { ...product, createdAt: serverTimestamp() });
    }
    results.push(`Seeded ${PRODUCTS.length} products`);
  } else {
    results.push('Products already exist — skipped');
  }

  // Check if categories already exist
  const existingCategories = await getDocs(query(collection(db, 'categories'), limit(1)));
  if (existingCategories.empty) {
    for (const cat of CATEGORIES) {
      await addDoc(collection(db, 'categories'), { ...cat, createdAt: serverTimestamp() });
    }
    results.push(`Seeded ${CATEGORIES.length} categories`);
  } else {
    results.push('Categories already exist — skipped');
  }

  // Always upsert siteConfig/main (safe to overwrite)
  const configRef = doc(db, 'siteConfig', 'main');
  const existing = await getDocs(query(collection(db, 'siteConfig'), limit(1)));
  if (existing.empty) {
    await setDoc(configRef, { ...SITE_CONFIG, updatedAt: serverTimestamp() });
    results.push('Seeded siteConfig/main');
  } else {
    results.push('siteConfig already exists — skipped');
  }

  return results.join('\n');
}
