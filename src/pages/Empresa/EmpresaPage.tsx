import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client/react';
import { toast } from 'react-toastify';

import {
  CadastroAlert,
  CadastroDataTable,
  CadastroPageHeader,
  CadastroPaginationBar,
  CadastroSearchBar,
  CadastroTableCell,
  CadastroTableRow,
  RowActions,
} from '../../components/cadastro';
import { GET_EMPRESAS } from '../../graphql/Empresa/queries';
import { REMOVE_EMPRESA_MUTATION } from '../../graphql/Empresa/mutations';
import type {
  EmpresaNode,
  GetEmpresasData,
  GetEmpresasVars,
  RemoveEmpresaData,
  RemoveEmpresaVars,
} from '../../graphql/Empresa/types';
import type { FilterClause, OrFilterInput } from '../../graphql/Common/types';
import { useCursorPagination } from '../../hooks/useCursorPagination';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { formatCnpj, stripCnpjMask } from '../../utils/cnpj';
import { confirmDeletion, getGraphQLErrorMessage } from '../../utils/confirmToast';
import { CADASTRO_PAGE_SIZE } from '../../constants/cadastro';
import { formatDatePtBr } from '../../utils/date';

const COLUMNS = ['Ações', 'Código', 'Cnpj', 'Nome Fantasia', 'Descrição', 'Data de Criação'];

function buildWhere(filter: string): OrFilterInput | null {
  const normalized = filter.trim();
  if (!normalized) return null;

  const stripped = stripCnpjMask(normalized);
  const or: FilterClause[] = [
    { nomeFantasia: { contains: normalized } },
    { descricao: { contains: normalized } },
  ];

  if (stripped) {
    or.unshift({ cnpj: { contains: stripped } });
  }

  if (/^\d+$/.test(normalized)) {
    or.unshift({ id: { eq: Number(normalized) } });
  }

  return { or };
}

export function EmpresaPage() {
  const navigate = useNavigate();
  const [globalFilter, setGlobalFilter] = useState('');
  const debouncedGlobalFilter = useDebouncedValue(globalFilter, 300);

  const {
    after,
    currentCursorIndex,
    hasPreviousPage,
    goToFirst,
    goToPrevious,
    goToNext,
    goToLastKnown,
    goToPageIndex,
    canGoToPage,
    canGoToLastKnown,
  } = useCursorPagination({ resetDeps: [debouncedGlobalFilter] });

  const variables = useMemo<GetEmpresasVars>(
    () => ({
      where: buildWhere(debouncedGlobalFilter),
      first: CADASTRO_PAGE_SIZE,
      after,
    }),
    [debouncedGlobalFilter, after],
  );

  const { data, loading, error, refetch } = useQuery<GetEmpresasData, GetEmpresasVars>(GET_EMPRESAS, {
    variables,
    notifyOnNetworkStatusChange: true,
  });

  const [removeEmpresa, { loading: removing }] = useMutation<RemoveEmpresaData, RemoveEmpresaVars>(
    REMOVE_EMPRESA_MUTATION,
  );
  const [removeErrorMessage, setRemoveErrorMessage] = useState<string | null>(null);

  const empresas: EmpresaNode[] = data?.empresas?.nodes ?? [];
  const pageInfo = data?.empresas?.pageInfo;
  const totalCount = data?.empresas?.totalCount ?? 0;
  const hasNextPage = !!pageInfo?.hasNextPage;
  const isBusy = loading || removing;

  const handleRemove = (id: string | number) => {
    setRemoveErrorMessage(null);

    confirmDeletion({
      title: 'Excluir empresa',
      message: 'Esta ação não pode ser desfeita. Deseja continuar?',
      confirmLabel: 'Sim, excluir',
      onConfirm: async () => {
        try {
          const result = await removeEmpresa({ variables: { id: Number(id) } });
          const mutationErrorMessage = getGraphQLErrorMessage(result.error);

          if (mutationErrorMessage) {
            setRemoveErrorMessage(mutationErrorMessage);
            toast.error(mutationErrorMessage);
            return;
          }

          await refetch(variables);
          toast.success('Empresa excluída com sucesso!');
        } catch (err: unknown) {
          const message =
            getGraphQLErrorMessage(err) ??
            'Não é possível remover a empresa. Tente novamente.';

          setRemoveErrorMessage(message);
          toast.error(message);
          console.error(err);
        }
      },
    });
  };

  return (
    <div className="space-y-4">
      <CadastroPageHeader
        title="Gestão de empresas"
        description="Veja a lista de empresas, busque por razão social/descrição e edite ou exclua registros."
        createLabel="Cadastrar empresa"
        onCreate={() => navigate('/dashboard/empresa/create')}
      />

      <CadastroSearchBar value={globalFilter} onChange={setGlobalFilter} />

      <CadastroDataTable
        columns={COLUMNS}
        empty={!empresas.length}
        loading={loading}
        loadingText="Carregando empresas..."
        emptyText="Nenhuma empresa encontrada com os filtros escolhidos."
        footer={
          <CadastroPaginationBar
            pageSize={CADASTRO_PAGE_SIZE}
            totalCount={totalCount}
            currentCursorIndex={currentCursorIndex}
            hasPreviousPage={hasPreviousPage}
            hasNextPage={hasNextPage}
            canGoToLastKnown={canGoToLastKnown}
            canGoToPage={canGoToPage}
            itemLabel={(count) => `${count} empresa${count === 1 ? '' : 's'}`}
            endCursor={pageInfo?.endCursor}
            onFirst={goToFirst}
            onPrevious={goToPrevious}
            onNext={goToNext}
            onLastKnown={goToLastKnown}
            onPageIndex={goToPageIndex}
          />
        }
      >
        {empresas.map((empresa) => (
          <CadastroTableRow key={empresa.id}>
            <CadastroTableCell>
              <RowActions
                onEdit={() => navigate(`/dashboard/empresa/create?id=${empresa.id}`)}
                onDelete={() => handleRemove(empresa.id)}
                disabled={isBusy}
              />
            </CadastroTableCell>
            <CadastroTableCell muted>{empresa.id}</CadastroTableCell>
            <CadastroTableCell>{formatCnpj(empresa.cnpj)}</CadastroTableCell>
            <CadastroTableCell>{empresa.nomeFantasia}</CadastroTableCell>
            <CadastroTableCell muted>{empresa.descricao || '—'}</CadastroTableCell>
            <CadastroTableCell muted>{formatDatePtBr(empresa.createdAt)}</CadastroTableCell>
          </CadastroTableRow>
        ))}
      </CadastroDataTable>

      {removeErrorMessage && <CadastroAlert>{removeErrorMessage}</CadastroAlert>}

      {error && (
        <CadastroAlert>
          Erro ao carregar empresas. Verifique a conexão e tente novamente.
        </CadastroAlert>
      )}
    </div>
  );
}
