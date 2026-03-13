import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { authStorage } from './authStorage';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  roles: string[];
}

interface AuthState {
  // State
  accessToken: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isRefreshing: boolean;

  // Actions
  setAuth: (accessToken: string, user: AuthUser) => void;
  setAccessToken: (accessToken: string) => void;
  setRefreshing: (value: boolean) => void;
  clearAuth: () => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>()(
  devtools(
    (set) => ({
      // Hidrata o estado inicial a partir do sessionStorage
      // Se o usuário deu F5, o token já está lá
      accessToken: authStorage.getToken(),
      user: authStorage.getUser<AuthUser>(),
      isAuthenticated: !!authStorage.getToken(),
      isRefreshing: false,

      // Login bem-sucedido: popula o estado
       setAuth: (accessToken, user) => {
        // Persiste no sessionStorage E atualiza o Zustand
        authStorage.setToken(accessToken);
        authStorage.setUser(user);
        set(
          { accessToken, user, isAuthenticated: true },
          false,
          'auth/setAuth'
        );
      },

      // Refresh silencioso: atualiza só o access token
      setAccessToken: (accessToken) => {
        authStorage.setToken(accessToken);
        set({ accessToken }, false, 'auth/setAccessToken');
      },

      // Flag para evitar múltiplos refreshes simultâneos
      setRefreshing: (value) =>
        set({ isRefreshing: value }, false, 'auth/setRefreshing'),

      // Logout: limpa tudo da memória
      clearAuth: () => {
         authStorage.clear();
        set(
          { accessToken: null, user: null, isAuthenticated: false, isRefreshing: false },
          false,
          'auth/clearAuth'
        );
      },
    }),
    { name: 'AuthStore' }
  )
);

// ─── Selectors (evitam re-renders desnecessários) ────────────────────────────

export const selectAccessToken = (s: AuthState) => s.accessToken;
export const selectUser = (s: AuthState) => s.user;
export const selectIsAuthenticated = (s: AuthState) => s.isAuthenticated;
export const selectIsRefreshing = (s: AuthState) => s.isRefreshing;
