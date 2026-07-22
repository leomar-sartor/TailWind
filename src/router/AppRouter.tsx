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
import { UnauthorizedPage } from '../pages/UnauthorizedPage';
import { CreateEditSetorPageWithLayout } from '../pages/CreateEditSetorPageWithLayout';
import { SetorPageWrapper } from '../pages/SetorPageWrapper';
import { CreateEditEmpresaPageWithLayout } from '../pages/CreateEditEmpresaPageWithLayout';
import { EmpresaPageWrapper } from '../pages/EmpresaPageWrapper';
import { CreateEditPesquisaPageWithLayout } from '../pages/CreateEditPesquisaPageWithLayout';
import { PesquisaPageWrapper } from '../pages/PesquisaPageWrapper';
import { ColaboradorPageWrapper } from '../pages/ColaboradorPageWrapper';
import { CreateEditColaboradorPageWithLayout } from '../pages/CreateEditColaboradorPageWithLayout';
import { SurveyPage } from '../pages/SurveyPage';
import { DispararPesquisaPageWithLayout } from '../pages/DispararPesquisaPageWithLayout';

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
              <Route path="/survey" element={<SurveyPage />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />

              {/* Rotas protegidas — qualquer usuário autenticado */}
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dash" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/dashboard/setor" element={<SetorPageWrapper />} />
                <Route path="/dashboard/setor/create" element={<CreateEditSetorPageWithLayout />} />
                <Route path="/dashboard/empresa" element={<EmpresaPageWrapper />} />
                <Route path="/dashboard/empresa/create" element={<CreateEditEmpresaPageWithLayout />} />
                <Route path="/dashboard/colaboradores" element={<ColaboradorPageWrapper />} />
                <Route path="/dashboard/colaboradores/create" element={<CreateEditColaboradorPageWithLayout />} />
                <Route path="/dashboard/pesquisa" element={<PesquisaPageWrapper />} />
                <Route path="/dashboard/pesquisa/create" element={<CreateEditPesquisaPageWithLayout />} />
                <Route path="/dashboard/pesquisa/disparar" element={<DispararPesquisaPageWithLayout />} />
              </Route>
            </Routes>
          </AuthGuard>
        </AuthProvider>
      </BrowserRouter>
    </ApolloProvider>
  );
}
