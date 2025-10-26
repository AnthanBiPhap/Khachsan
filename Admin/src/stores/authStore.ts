import { create } from 'zustand'
import { devtools, persist, createJSONStorage } from 'zustand/middleware';

interface ITokens {
  accessToken: string;
  refreshToken: string;
}
interface IUser {
  _id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  role: string;
  status: string;
  preferences: string[];
  createdAt: string;
  updatedAt: string;
}

type TAuthStore ={
  tokens: null | ITokens;
  user: null | IUser;
  setTokens: (tokens: ITokens) => void;
  clearTokens: () => void;
  setUser: (user: IUser | null)=>void;
  logout: () => void;
  isAdminOrStaff: () => boolean;
}

export const useAuthStore = create<TAuthStore>()(
  devtools(
    persist(
      (set) => ({
        tokens: null,
        user: null,
        setTokens: (tokens: ITokens) => {
          set({ tokens });
        },
        clearTokens: () => set({ tokens: null }),
        setUser: (user: IUser |  null)=>{
          set({ user });
        },
        logout: () => {
          set({ tokens: null, user: null });
        },
        isAdminOrStaff: () => {
          const state = useAuthStore.getState();
          if (!state.user) return false;
          return state.user.role === 'admin' || state.user.role === 'staff';
        }
      }),
      {
        name: 'auth-storage', // unique name
        storage: createJSONStorage(() => localStorage), // use local storage
      }
    )
  )
);