// auth/AuthGuard.tsx
import { ReactNode } from 'react';
import { useAuth } from './AuthContext';

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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <span> Carregando...</span>
      </div>
    );
  }

  return <>{children}</>;
}
