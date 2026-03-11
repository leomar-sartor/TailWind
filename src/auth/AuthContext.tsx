// auth/AuthContext.tsx
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { useMutation } from '@apollo/client/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore, AuthUser } from './authStore';
import { apolloClient } from '../graphql/client';
import {
  LOGIN_MUTATION,
  LOGOUT_MUTATION,
  REFRESH_TOKEN_MUTATION,
} from '../graphql/mutations/auth.mutation';

// ─── Types ────────────────────────────────────────────────────────────────────

interface LoginInput {
  email: string;
  password: string;
}

interface AuthContextValue {
  isLoading: boolean;
  login: (input: LoginInput) => Promise<void>;
  logout: () => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const { setAuth, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [loginMutation] = useMutation<{
    login: { accessToken: string; user: AuthUser };
  }>(LOGIN_MUTATION);

  const [logoutMutation] = useMutation(LOGOUT_MUTATION);

  const [refreshMutation] = useMutation<{
    refreshToken: { accessToken: string; user: AuthUser };
  }>(REFRESH_TOKEN_MUTATION);

  // ── Tentativa de restaurar sessão na inicialização do app ──────────────────
  // O access token não está em nenhum storage — vive apenas em memória.
  // Mas o refresh token está no cookie httpOnly.
  // Logo: ao iniciar o app, chamamos refresh. Se o cookie existir e for válido,
  // a sessão é restaurada silenciosamente. Se não, o usuário vai para o login.
  useEffect(() => {
    const tryRestoreSession = async () => {
      try {
        const { data } = await refreshMutation();

        if (data?.refreshToken) {
          const { accessToken, user } = data.refreshToken;
          setAuth(accessToken, user);
        }
      } catch {
        // Cookie expirado ou inexistente — estado já é "não autenticado"
        clearAuth();
      } finally {
        setIsLoading(false);
      }
    };

    tryRestoreSession();
  }, []);

  // ── Login ──────────────────────────────────────────────────────────────────
  // MutateResult não expõe 'errors' — no Apollo Client 4, erros de mutation
  // lançam uma exceção. O try/catch no componente que chama login() captura isso.

  const login = async (input: LoginInput) => {
    const result = await loginMutation({ variables: { input } });

    if (!result.data?.login) {
      throw new Error('Unexpected error during login.');
    }

    const { accessToken, user } = result.data.login;
    setAuth(accessToken, user);

    // Redireciona para a rota que o usuário tentou acessar antes do login
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/dashboard';
    navigate(from, { replace: true });
  };

  // ── Logout ─────────────────────────────────────────────────────────────────

  const logout = async () => {
    try {
      // Chama o backend para invalidar o refresh token no banco/Redis
      // e apagar o cookie httpOnly no response
      await logoutMutation();
    } finally {
      // Mesmo se a request falhar, limpamos o estado local
      clearAuth();
      await apolloClient.clearStore();
      navigate('/login', { replace: true });
    }
  };

  return (
    <AuthContext.Provider value={{ isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}