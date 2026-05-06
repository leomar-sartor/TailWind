// router/AppRouter.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client/react';
import { apolloClient } from '../graphql/client';
import { AuthProvider } from '../auth/AuthContext';
import { ProtectedRoute } from '../auth/ProtectedRoute';
import { AuthGuard } from '../auth/AuthGuard';

// Pages — substitua pelos seus componentes reais
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { CreateEditSetorPageWithLayout } from '../pages/CreateEditSetorPageWithLayout';
import { SetorPageWrapper } from '../pages/SetorPageWrapper';
import { CreateEditEmpresaPageWithLayout } from '../pages/CreateEditEmpresaPageWithLayout';
import { EmpresaPageWrapper } from '../pages/EmpresaPageWrapper';
import { SurveyPage } from '../pages/SurveyPage';

// ─── AppRouter ────────────────────────────────────────────────────────────────
// Hierarquia de providers:
//   ApolloProvider → BrowserRouter → AuthProvider → Routes
//
// AuthProvider precisa estar DENTRO do ApolloProvider (usa useMutation)
// AuthProvider precisa estar DENTRO do BrowserRouter (usa useNavigate)

export function AppRouter() {
  return (
    <ApolloProvider client={apolloClient}>
      <BrowserRouter>
        <AuthProvider>
          <AuthGuard>
            <Routes>
              {/* Rotas públicas */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/dash" element={<DashboardPage />} />

              <Route path="/survey" element={<SurveyPage />} />
              
              {/* Redireciona raiz para login enquanto não há mais páginas */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              
              {/* Rotas protegidas — qualquer usuário autenticado */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/dashboard/setor" element={<SetorPageWrapper />} />
                <Route path="/dashboard/setor/create" element={<CreateEditSetorPageWithLayout />} />
                <Route path="/dashboard/empresa" element={<EmpresaPageWrapper />} />
                <Route path="/dashboard/empresa/create" element={<CreateEditEmpresaPageWithLayout />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
              </Route>

              {/* Rotas protegidas por role */}
              {/* <Route element={<ProtectedRoute requiredRoles={['Admin']} />}>
                <Route path="/admin" element={<AdminPage />} />
              </Route> */}
            </Routes>
          </AuthGuard>
        </AuthProvider>
      </BrowserRouter>
    </ApolloProvider>
  );
}