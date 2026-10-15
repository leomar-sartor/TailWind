import { UsersPage } from '../pages/UsersPage';
import { PermissionsPage } from '../pages/PermissionsPage';
import { DashboardOperationsOverview } from '../components/dashboard/DashboardOperationsOverview';
import { useActiveContext } from '../auth/ActiveContext';
import { FormErrorAlert } from '../components/FormErrorAlert';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client/react';
import { apolloClient } from '../graphql/client';
import { AuthProvider } from '../auth/AuthContext';
import { ProtectedRoute } from '../auth/ProtectedRoute';
import { AuthGuard } from '../auth/AuthGuard';
import { ActiveContextGate } from '../auth/ActiveContextGate';
import { DashboardPageShell } from '../layouts/DashboardPageShell';

import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { UnauthorizedPage } from '../pages/UnauthorizedPage';
import { SetorPage } from '../pages/Setor/SetorPage';
import { CreateEditSetorPage } from '../pages/Setor/CreateEditSetorPage';
import { EmpresaPage } from '../pages/Empresa/EmpresaPage';
import { CreateEditEmpresaPage } from '../pages/Empresa/CreateEditEmpresaPage';
import { PesquisaPage } from '../pages/Pesquisa/PesquisaPage';
import { CreateEditPesquisaPage } from '../pages/Pesquisa/CreateEditPesquisaPage';
import { PesquisaPadronizadaPage } from '../pages/Pesquisa/PesquisaPadronizadaPage';
import { AccessManagementPage } from '../pages/AccessManagementPage';
import { TenantsPage } from '../pages/TenantsPage';
import { ColaboradorPage } from '../pages/Colaborador/ColaboradorPage';
import { CreateEditColaboradorPage } from '../pages/Colaborador/CreateEditColaboradorPage';
import { CategoriaPage } from '../pages/Categoria/CategoriaPage';
import { CreateEditCategoriaPage } from '../pages/Categoria/CreateEditCategoriaPage';
import { SurveyPage } from '../pages/SurveyPage';
import { DispararPesquisaPage } from '../pages/DispararPesquisaPage';

function ConsultarPage() {
  const { isAdmin, permissions } = useActiveContext();
  return isAdmin || permissions.includes('pesquisa.acompanhar')
    ? <DashboardOperationsOverview /> : <FormErrorAlert message="Você não possui permissão para consultar pesquisas." />;
}

export function AppRouter() {
  return (
    <ApolloProvider client={apolloClient}>
      <BrowserRouter>
        <AuthProvider>
          <AuthGuard>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/survey" element={<SurveyPage />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />

              <Route element={<ProtectedRoute />}>
                <Route element={<ActiveContextGate />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dash" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route
                  path="/dashboard/setor"
                  element={
                    <DashboardPageShell page="setor">
                      <SetorPage />
                    </DashboardPageShell>
                  }
                />
                <Route
                  path="/dashboard/setor/create"
                  element={
                    <DashboardPageShell page="setor" showFlashMessage={false}>
                      <CreateEditSetorPage />
                    </DashboardPageShell>
                  }
                />
                <Route
                  path="/dashboard/empresa"
                  element={
                    <DashboardPageShell page="empresa">
                      <EmpresaPage />
                    </DashboardPageShell>
                  }
                />
                <Route
                  path="/dashboard/empresa/create"
                  element={
                    <DashboardPageShell page="empresa" showFlashMessage={false}>
                      <CreateEditEmpresaPage />
                    </DashboardPageShell>
                  }
                />
                <Route
                  path="/dashboard/colaboradores"
                  element={
                    <DashboardPageShell page="colaboradores">
                      <ColaboradorPage />
                    </DashboardPageShell>
                  }
                />
                <Route
                  path="/dashboard/colaboradores/create"
                  element={
                    <DashboardPageShell page="colaboradores" showFlashMessage={false}>
                      <CreateEditColaboradorPage />
                    </DashboardPageShell>
                  }
                />
                <Route
                  path="/dashboard/categoria"
                  element={
                    <DashboardPageShell page="categoria">
                      <CategoriaPage />
                    </DashboardPageShell>
                  }
                />
                <Route
                  path="/dashboard/categoria/create"
                  element={
                    <DashboardPageShell page="categoria" showFlashMessage={false}>
                      <CreateEditCategoriaPage />
                    </DashboardPageShell>
                  }
                />
                <Route
                  path="/dashboard/pesquisa"
                  element={
                    <DashboardPageShell page="pesquisa">
                      <PesquisaPage />
                    </DashboardPageShell>
                  }
                />
                <Route
                  path="/dashboard/pesquisa/create"
                  element={
                    <DashboardPageShell page="pesquisa" showFlashMessage={false}>
                      <CreateEditPesquisaPage />
                    </DashboardPageShell>
                  }
                />
                <Route
                  path="/dashboard/pesquisa-padronizada"
                  element={
                    <DashboardPageShell page="pesquisaPadronizada">
                      <PesquisaPadronizadaPage />
                    </DashboardPageShell>
                  }
                />
                <Route path="/dashboard/pesquisa-padronizada/create" element={
                  <DashboardPageShell page="pesquisaPadronizada" showFlashMessage={false}><PesquisaPadronizadaPage /></DashboardPageShell>
                } />
                <Route
                  path="/dashboard/perfis"
                  element={
                    <DashboardPageShell page="acessos">
                      <AccessManagementPage />
                    </DashboardPageShell>
                  }
                />
                <Route path="/dashboard/acessos" element={<Navigate to="/dashboard/perfis" replace />} />
                <Route path="/dashboard/usuarios" element={<DashboardPageShell page="usuarios"><UsersPage /></DashboardPageShell>} />
                <Route path="/dashboard/permissoes" element={<DashboardPageShell page="permissoes"><PermissionsPage /></DashboardPageShell>} />
                <Route path="/dashboard/consultar" element={<DashboardPageShell page="consultar"><ConsultarPage /></DashboardPageShell>} />
                <Route path="/dashboard/tenants" element={<DashboardPageShell page="tenants"><TenantsPage /></DashboardPageShell>} />
                <Route
                  path="/dashboard/pesquisa/disparar"
                  element={
                    <DashboardPageShell page="enviar" showFlashMessage={false}>
                      <DispararPesquisaPage />
                    </DashboardPageShell>
                  }
                />
                </Route>
              </Route>
            </Routes>
          </AuthGuard>
        </AuthProvider>
      </BrowserRouter>
    </ApolloProvider>
  );
}
