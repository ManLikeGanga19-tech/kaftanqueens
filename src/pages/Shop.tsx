import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, ChevronDown, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ProductCard from '../components/ProductCard';
import Breadcrumbs from '../components/Breadcrumbs';
import { Category, Product } from '../types';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';

const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: "Luxury Zari Silk Dera",
    description: "Flowing silk dera with intricate gold zari embroidery along the neckline and sleeves.",
    category: Category.TRADITIONAL,
    price: 1,
    currencies: { USD: 120, EUR: 110 },
    sizes: ["One Size"],
    colors: ["Gold", "Midnight Black"],
    stock: 3,
    rating: 4.9,
    reviewsCount: 15,
    images: ["https://images.unsplash.com/photo-1620331311520-246422fd82f9?q=80&w=800&auto=format&fit=crop"],
    createdAt: new Date()
  },
  {
    id: '2',
    name: "Coastal Breeze Cotton Kaftan",
    description: "Lightweight, breathable cotton kaftan featuring traditional Swahili print patterns.",
    category: Category.TRADITIONAL,
    price: 1,
    currencies: { USD: 55, EUR: 50 },
    sizes: ["One Size"],
    colors: ["Ocean Blue", "White"],
    stock: 12,
    rating: 4.7,
    reviewsCount: 22,
    images: ["https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?q=80&w=800&auto=format&fit=crop"],
    createdAt: new Date()
  },
  {
    id: '3',
    name: "Modern Minimalist Linen Dera",
    description: "A contemporary take on the dera. Clean lines and premium linen.",
    category: Category.MODERN,
    price: 1,
    currencies: { USD: 75, EUR: 70 },
    sizes: ["S", "M", "L"],
    colors: ["Sage", "Sand", "Rose"],
    stock: 8,
    rating: 4.8,
    reviewsCount: 10,
    images: ["https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=800&auto=format&fit=crop"],
    createdAt: new Date()
  },
  {
    id: '4',
    name: "Royal Emerald Velvet Kaftan",
    description: "Heavy velvet kaftan with hand-stitched crystal detailing.",
    category: Category.TRADITIONAL,
    price: 1,
    currencies: { USD: 170, EUR: 160 },
    sizes: ["M", "L"],
    colors: ["Emerald"],
    stock: 2,
    rating: 5.0,
    reviewsCount: 5,
    images: ["https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop"],
    createdAt: new Date()
  }
];

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(searchParams.get('category'));
  const [sortBy, setSortBy] = useState('newest');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    setActiveCategory(searchParams.get('category'));
    const q = searchParams.get('search');
    if (q) setSearchQuery(q);
  }, [searchParams]);

  const filteredProducts = useMemo(() => {
    return MOCK_PRODUCTS.filter(product => {
      const matchesCategory = !activeCategory || product.category === activeCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           product.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'popular') return b.rating - a.rating;
      return 0; // Default: Newest
    });
  }, [activeCategory, searchQuery, sortBy]);

  const handleCategoryChange = (category: string | null) => {
    if (category) {
      searchParams.set('category', category);
    } else {
      searchParams.delete('category');
    }
    setSearchParams(searchParams);
    setActiveCategory(category);
  };

  return (
    <div className="container mx-auto px-4 py-20 pb-40 space-y-8">
      <Breadcrumbs items={[{ label: 'Shop' }]} />
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-brand-primary/10 pb-12">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.3em] font-bold text-brand-maroon">Collections</p>
          <h1 className="text-5xl md:text-6xl font-serif">The Royal Closet</h1>
          <p className="text-brand-primary/60 max-w-md uppercase text-[10px] tracking-widest font-medium">
            Explore our curated selection of {activeCategory || 'all'} kaftans.
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-primary/30" size={16} />
            <Input 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 bg-transparent border-brand-primary/10 rounded-none focus-visible:ring-brand-accent uppercase text-[10px] tracking-widest"
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40 h-12 rounded-none border-brand-primary/10 uppercase text-[10px] tracking-widest font-bold">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent className="bg-brand-secondary border-brand-primary/10">
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-8 overflow-x-auto pb-4 scrollbar-hide">
        <button 
          onClick={() => handleCategoryChange(null)}
          className={`flex-shrink-0 uppercase text-[11px] tracking-[0.2em] font-bold pb-2 border-b-2 transition-all ${!activeCategory ? 'border-brand-accent text-brand-primary' : 'border-transparent text-brand-primary/40'}`}
        >
          All Items
        </button>
        <button 
          onClick={() => handleCategoryChange(Category.TRADITIONAL)}
          className={`flex-shrink-0 uppercase text-[11px] tracking-[0.2em] font-bold pb-2 border-b-2 transition-all ${activeCategory === Category.TRADITIONAL ? 'border-brand-accent text-brand-primary' : 'border-transparent text-brand-primary/40'}`}
        >
          Traditional
        </button>
        <button 
          onClick={() => handleCategoryChange(Category.MODERN)}
          className={`flex-shrink-0 uppercase text-[11px] tracking-[0.2em] font-bold pb-2 border-b-2 transition-all ${activeCategory === Category.MODERN ? 'border-brand-accent text-brand-primary' : 'border-transparent text-brand-primary/40'}`}
        >
          Modern
        </button>
      </div>

      {/* Results Info */}
      <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-bold opacity-40">
        <p>Showing {filteredProducts.length} Results</p>
        <div className="flex items-center space-x-2">
          {activeCategory && (
            <Badge variant="secondary" className="rounded-none bg-brand-primary/5 hover:bg-brand-primary/5 px-2 py-1 flex items-center gap-2">
              {activeCategory}
              <button 
                onClick={() => handleCategoryChange(null)}
                className="hover:text-brand-accent"
              >
                ×
              </button>
            </Badge>
          )}
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
        <AnimatePresence mode="popLayout">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </AnimatePresence>
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-20 bg-brand-primary/5 space-y-4">
          <p className="font-serif text-2xl uppercase tracking-widest opacity-30 italic">No products found</p>
          <button 
            onClick={() => {setSearchQuery(''); handleCategoryChange(null);}}
            className="text-brand-accent uppercase text-[10px] tracking-tighter font-bold hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
};

export default Shop;
