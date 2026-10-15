import { useQuery } from '@apollo/client/react';
import { useNavigate } from 'react-router-dom';
import { useActiveContext } from '../../auth/ActiveContext';
import { GET_EMPRESA_BY_ID } from '../../graphql/Empresa/queries';
import type { GetEmpresaByIdData, GetEmpresaByIdVars } from '../../graphql/Empresa/types';
import { Button } from '../../components/Button';
import { FormErrorAlert } from '../../components/FormErrorAlert';
import { formatCnpj } from '../../utils/cnpj';
import { getGraphQLErrorMessage } from '../../utils/confirmToast';

export function MinhaEmpresaPage() {
  const { activeContext, permissions } = useActiveContext();
  const navigate = useNavigate();
  const { data, loading, error } = useQuery<GetEmpresaByIdData, GetEmpresaByIdVars>(GET_EMPRESA_BY_ID, {
    variables: { id: Number(activeContext.companyId) }, skip: !activeContext.companyId, fetchPolicy: 'network-only',
  });
  const company = error ? null : data?.empresaById;
  return <div className="space-y-6">
    <header className="flex items-center justify-between gap-4">
      <h2 className="text-xl font-semibold dashboard-text">Minha empresa</h2>
      {company && permissions.includes('empresa.editar') && <Button type="button" onClick={() => navigate('/dashboard/empresa/create')}>Editar dados</Button>}
    </header>
    <FormErrorAlert message={error ? getGraphQLErrorMessage(error) ?? 'Não foi possível carregar os dados da empresa.' : null} />
    {loading && <p>Carregando empresa...</p>}
    {company && <dl className="dashboard-card border p-6 space-y-4">
      <div><dt className="font-semibold">Nome fantasia</dt><dd>{company.nomeFantasia}</dd></div>
      <div><dt className="font-semibold">CNPJ</dt><dd>{formatCnpj(company.cnpj)}</dd></div>
      <div><dt className="font-semibold">Descrição</dt><dd>{company.descricao || 'Não informada'}</dd></div>
    </dl>}
    {!loading && !error && !company && <p>Selecione uma empresa autorizada no contexto ativo.</p>}
  </div>;
}
