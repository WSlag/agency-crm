import { create } from 'zustand';
import { User } from 'firebase/auth';
import { auth } from '../config/firebase';
import { signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  customClaims: { role?: string; branchId?: string | null } | null;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setCustomClaims: (claims: { role?: string; branchId?: string | null } | null) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  error: null,
  customClaims: null,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setCustomClaims: (claims) => set({ customClaims: claims }),
  signIn: async (email, password) => {
    try {
      set({ loading: true, error: null });
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idTokenResult = await userCredential.user.getIdTokenResult();
      set({ 
        user: userCredential.user,
        customClaims: {
          role: idTokenResult.claims.role as string,
          branchId: idTokenResult.claims.branchId as string | null
        }
      });
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  signOut: async () => {
    try {
      await firebaseSignOut(auth);
      set({ user: null, customClaims: null });
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  }
}));