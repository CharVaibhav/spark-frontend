import { create } from 'zustand';

interface AuthState {
  token: string | null;
  user: {
    id: string;
    email: string;
    name: string;
    available_credits: number;
  } | null;
  setAuth: (token: string, user: any) => void;
  updateCredits: (newCredits: number) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,

  setAuth: (token, user) => set({ token, user }),
  
  updateCredits: (credits) => set((state) => ({ 
    user: state.user ? { ...state.user, available_credits: credits } : null 
  })),

  logout: () => set({ token: null, user: null })
}));
