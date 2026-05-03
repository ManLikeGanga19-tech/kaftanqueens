import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import ProductCard from '../components/ProductCard';
import Breadcrumbs from '../components/Breadcrumbs';
import { CategoryDoc, Product } from '../types';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(searchParams.get('category'));
  const [sortBy, setSortBy] = useState('newest');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setActiveCategory(searchParams.get('category'));
    const q = searchParams.get('search');
    if (q) setSearchQuery(q);
  }, [searchParams]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [prodSnap, catSnap] = await Promise.all([
          getDocs(query(collection(db, 'products'), orderBy('createdAt', 'desc'))),
          getDocs(collection(db, 'categories')),
        ]);
        const allProds = prodSnap.docs.map(d => ({ id: d.id, ...d.data() } as Product));
        const allCats = catSnap.docs.map(d => ({ id: d.id, ...d.data() } as CategoryDoc));
        setProducts(allProds.filter(p => p.isActive !== false));
        setCategories(allCats.filter(c => c.isActive !== false).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)));
      } catch {
        setProducts([]);
      }
      setLoading(false);
    };
    load();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesCategory = !activeCategory || product.category === activeCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return (a.discountedPrice ?? a.price) - (b.discountedPrice ?? b.price);
      if (sortBy === 'price-high') return (b.discountedPrice ?? b.price) - (a.discountedPrice ?? a.price);
      if (sortBy === 'popular') return b.rating - a.rating;
      return 0;
    });
  }, [products, activeCategory, searchQuery, sortBy]);

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

      {/* Filter Tabs — All + dynamic categories from Firestore */}
      <div className="flex items-center space-x-8 overflow-x-auto pb-4 scrollbar-hide">
        <button
          onClick={() => handleCategoryChange(null)}
          className={`flex-shrink-0 uppercase text-[11px] tracking-[0.2em] font-bold pb-2 border-b-2 transition-all ${!activeCategory ? 'border-brand-accent text-brand-primary' : 'border-transparent text-brand-primary/40'}`}
        >
          All Items
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => handleCategoryChange(cat.slug)}
            className={`flex-shrink-0 uppercase text-[11px] tracking-[0.2em] font-bold pb-2 border-b-2 transition-all ${activeCategory === cat.slug ? 'border-brand-accent text-brand-primary' : 'border-transparent text-brand-primary/40'}`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Results Info */}
      <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-bold opacity-40">
        <p>Showing {filteredProducts.length} Results</p>
        <div className="flex items-center space-x-2">
          {activeCategory && (
            <Badge variant="secondary" className="rounded-none bg-brand-primary/5 hover:bg-brand-primary/5 px-2 py-1 flex items-center gap-2">
              {activeCategory}
              <button onClick={() => handleCategoryChange(null)} className="hover:text-brand-accent">×</button>
            </Badge>
          )}
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse space-y-4">
              <div className="aspect-[3/4] bg-brand-primary/5" />
              <div className="h-4 bg-brand-primary/5 rounded w-3/4" />
              <div className="h-3 bg-brand-primary/5 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </AnimatePresence>
        </div>
      )}

      {!loading && filteredProducts.length === 0 && (
        <div className="text-center py-20 bg-brand-primary/5 space-y-4">
          <p className="font-serif text-2xl uppercase tracking-widest opacity-30 italic">No products found</p>
          <button
            onClick={() => { setSearchQuery(''); handleCategoryChange(null); }}
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
