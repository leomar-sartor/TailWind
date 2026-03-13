// auth/AuthContext.tsx
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useRef,
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
import { jwtDecode } from 'jwt-decode';
interface JwtPayload {
  sub: string;
  email: string;
  exp: number; // expiração em Unix timestamp (segundos)
}

// Retorna true se o token ainda é válido por mais de 30 segundos
// Os 30s de margem evitam usar um token que vai expirar durante a request
function isTokenValid(token: string): boolean {
  try {
    const { exp } = jwtDecode<JwtPayload>(token);
    return exp * 1000 > Date.now() + 30_000;
  } catch {
    return false;
  }
}

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

  const hasRestoredSession = useRef(false);

  useEffect(() => {

    if (hasRestoredSession.current) return;
    hasRestoredSession.current = true;

    const tryRestoreSession = async () => {

      const currentToken = useAuthStore.getState().accessToken;

      // Token veio do sessionStorage e ainda é válido — não precisa de refresh
      if (currentToken && isTokenValid(currentToken)) {
        setIsLoading(false);
        return; // ← F5 cai aqui enquanto o token não expirar
      }

      try {
        const { data } = await refreshMutation();

        if (data?.refreshToken) {
          const { accessToken, user } = data.refreshToken;
          setAuth(accessToken, user);// ← seta os dois no Zustand
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
      throw new Error('Erro durante o login.');
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