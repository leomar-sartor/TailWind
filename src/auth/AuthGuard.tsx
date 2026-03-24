// auth/AuthGuard.tsx
import { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { Loader } from 'lucide-react';

// Bloqueia a renderização das rotas enquanto o app tenta restaurar
// a sessão via refresh token. Sem isso, o ProtectedRoute redirecionaria
// para /login antes mesmo de saber se o usuário tem sessão válida.

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isLoading } = useAuth();

  if (isLoading) {
    // Substitua pelo seu componente de loading/splash screen
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">

        <div className="flex items-center gap-3 bg-white/80 dark:bg-black/60 px-6 py-4 rounded-2xl shadow-xl">

          <Loader
            color="#3e9392"
            className="size-6 animate-spin [animation-duration:3s]"
          />

          <span className="text-sm font-medium text-foreground">
            Carregando
          </span>

        </div>

      </div>
    );
  }

  return <>{children}</>;
}
