import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

export function useWishlist() {
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

  return { wishlist, toggle, isWishlisted, loading };
}
