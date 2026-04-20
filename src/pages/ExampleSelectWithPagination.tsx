import { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_EMPRESAS_PAGINATED } from '../graphql/queries/setor.queries';
import { SelectWithSearch, SelectItem } from '../components/Select/SelectWithSearch';

// Exemplo de uso do SelectWithSearch com paginação infinita
export function SelectEmpresaComPaginacao() {
  const [searchQuery, setSearchQuery] = useState('');
  const [empresasCursor, setEmpresasCursor] = useState<string | null>(null);
  const [empresasItems, setEmpresasItems] = useState<SelectItem[]>([]);
  const [selectedEmpresaId, setSelectedEmpresaId] = useState<string | number>();

  // Query inicial (primeiras 10 empresas)
  const { data: initialData, loading: initialLoading, fetchMore } = useQuery(
    GET_EMPRESAS_PAGINATED,
    {
      variables: {
        where: searchQuery ? { razaoSocial: { contains: searchQuery } } : null,
        first: 10,
      },
    }
  );

  // Carregar itens iniciais quando os dados chegam
  const hasMore = initialData?.empresas?.pageInfo?.hasNextPage ?? false;
  const nextCursor = initialData?.empresas?.pageInfo?.endCursor;

  // Atualizar lista quando dados iniciais chegam
  const firstLoadDone = useMemo(() => {
    if (initialData?.empresas?.nodes && empresasItems.length === 0) {
      const items = initialData.empresas.nodes.map((emp: any) => ({
        id: emp.id,
        label: emp.razaoSocial,
      }));
      setEmpresasItems(items);
      return true;
    }
    return false;
  }, [initialData, empresasItems.length]);

  // Detectar mudança na busca
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setEmpresasItems([]); // Limpar itens
    setEmpresasCursor(null); // Reset cursor
  }, []);

  // Carregar mais empresas quando rolar ao fim
  const handleLoadMore = useCallback(async () => {
    if (!hasMore || !nextCursor) return;

    try {
      await fetchMore({
        variables: {
          where: searchQuery ? { razaoSocial: { contains: searchQuery } } : null,
          first: 10,
          after: nextCursor,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;

          const newItems = fetchMoreResult.empresas.nodes.map((emp: any) => ({
            id: emp.id,
            label: emp.razaoSocial,
          }));

          setEmpresasItems((prev) => [...prev, ...newItems]);
          return fetchMoreResult;
        },
      });
    } catch (err) {
      console.error('Erro ao carregar mais empresas:', err);
    }
  }, [hasMore, nextCursor, searchQuery, fetchMore]);

  return (
    <SelectWithSearch
      items={empresasItems}
      selectedId={selectedEmpresaId}
      placeholder="Selecione uma empresa"
      searchPlaceholder="Buscar empresa..."
      isLoading={initialLoading}
      hasMore={hasMore}
      onLoadMore={handleLoadMore}
      onSearch={handleSearch}
      onChange={(item) => setSelectedEmpresaId(item.id)}
    />
  );
}
