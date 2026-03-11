import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore, selectIsAuthenticated } from './authStore';

interface ProtectedRouteProps {
  requiredRoles?: string[];
}

export function ProtectedRoute({ requiredRoles }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  if (!isAuthenticated) {
    // Preserva a rota original para redirect pós-login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRoles?.length && !requiredRoles.some((r) => user?.roles.includes(r))) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
