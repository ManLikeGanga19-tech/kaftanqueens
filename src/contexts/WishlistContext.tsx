import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './AuthContext';

interface WishlistContextType {
  wishlist: string[];
  toggle: (productId: string) => Promise<void>;
  isWishlisted: (productId: string) => boolean;
  loading: boolean;
}

const WishlistContext = createContext<WishlistContextType>({
  wishlist: [],
  toggle: async () => {},
  isWishlisted: () => false,
  loading: false,
});

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) { setWishlist([]); return; }
    setLoading(true);
    getDoc(doc(db, 'wishlists', user.uid))
      .then(snap => setWishlist(snap.exists() ? (snap.data().productIds ?? []) : []))
      .catch(() => setWishlist([]))
      .finally(() => setLoading(false));
  }, [user]);

  const toggle = useCallback(async (productId: string) => {
    if (!user) return;
    const next = wishlist.includes(productId)
      ? wishlist.filter(id => id !== productId)
      : [...wishlist, productId];
    setWishlist(next);
    await setDoc(doc(db, 'wishlists', user.uid), { productIds: next }, { merge: true });
  }, [user, wishlist]);

  const isWishlisted = useCallback((productId: string) => wishlist.includes(productId), [wishlist]);

  return (
    <WishlistContext.Provider value={{ wishlist, toggle, isWishlisted, loading }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}
