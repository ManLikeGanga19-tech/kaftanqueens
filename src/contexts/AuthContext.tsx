import { FC, ReactNode, createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  loginWithGoogle: () => Promise<User>;
  loginWithFacebook: () => Promise<User>;
  logout: () => Promise<void>;
  /** @deprecated use loginWithGoogle instead */
  login: () => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAILS = ['orwenjodaniel19@gmail.com', 'ericabuto@gmail.com'];

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const syncProfile = async (user: User) => {
    const isAdmin = ADMIN_EMAILS.includes(user.email ?? '');
    const role = isAdmin ? UserRole.ADMIN : UserRole.USER;

    try {
      const profileDoc = await getDoc(doc(db, 'users', user.uid));
      if (profileDoc.exists()) {
        const existing = { id: user.uid, ...profileDoc.data() } as UserProfile;
        if (existing.role !== role) {
          await setDoc(doc(db, 'users', user.uid), { ...existing, role }, { merge: true });
          existing.role = role;
        }
        setProfile(existing);
      } else {
        const newProfile: UserProfile = {
          id: user.uid,
          name: user.displayName || 'Guest',
          email: user.email || '',
          role,
          browsingHistory: [],
        };
        await setDoc(doc(db, 'users', user.uid), newProfile);
        setProfile(newProfile);
      }
    } catch {
      // Firestore unavailable — set profile from auth data so the app never stays blocked
      setProfile({
        id: user.uid,
        name: user.displayName || 'Guest',
        email: user.email || '',
        role,
        browsingHistory: [],
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (!user) setProfile(null);
      setLoading(false); // unblock UI immediately — profile syncs in background
      if (user) syncProfile(user);
    });
    return unsubscribe;
  }, []);

  const loginWithGoogle = async (): Promise<User> => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return result.user;
  };

  const loginWithFacebook = async (): Promise<User> => {
    const provider = new FacebookAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return result.user;
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      loginWithGoogle,
      loginWithFacebook,
      logout,
      login: loginWithGoogle,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
