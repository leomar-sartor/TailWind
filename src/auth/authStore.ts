import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
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
      // Initial state — token vive apenas em memória RAM
      accessToken: null,
      user: null,
      isAuthenticated: false,
      isRefreshing: false,

      // Login bem-sucedido: popula o estado
      setAuth: (accessToken, user) =>
        set({ accessToken, user, isAuthenticated: true }, false, 'auth/setAuth'),

      // Refresh silencioso: atualiza só o access token
      setAccessToken: (accessToken) =>
        set({ accessToken }, false, 'auth/setAccessToken'),

      // Flag para evitar múltiplos refreshes simultâneos
      setRefreshing: (value) =>
        set({ isRefreshing: value }, false, 'auth/setRefreshing'),

      // Logout: limpa tudo da memória
      clearAuth: () =>
        set(
          { accessToken: null, user: null, isAuthenticated: false, isRefreshing: false },
          false,
          'auth/clearAuth'
        ),
    }),
    { name: 'AuthStore' }
  )
);

// ─── Selectors (evitam re-renders desnecessários) ────────────────────────────

export const selectAccessToken = (s: AuthState) => s.accessToken;
export const selectUser = (s: AuthState) => s.user;
export const selectIsAuthenticated = (s: AuthState) => s.isAuthenticated;
export const selectIsRefreshing = (s: AuthState) => s.isRefreshing;
