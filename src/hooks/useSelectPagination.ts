import { useState, useCallback } from 'react';
import { SelectItem } from '../components/Select/SelectWithSearch';

type UseSelectPaginationOptions = {
  pageSize?: number;
};

type UseSelectPaginationReturn = {
  items: SelectItem[];
  selectedId: string | number | undefined;
  searchQuery: string;
  isLoading: boolean;
  hasMore: boolean;
  setItems: (items: SelectItem[]) => void;
  setSelectedId: (id: string | number | undefined) => void;
  setSearchQuery: (query: string) => void;
  setIsLoading: (loading: boolean) => void;
  setHasMore: (hasMore: boolean) => void;
  handleLoadMore: () => void;
  handleSearch: (query: string) => void;
};

export function useSelectPagination(
  options: UseSelectPaginationOptions = {}
): UseSelectPaginationReturn {
  const { pageSize = 10 } = options;

  const [items, setItems] = useState<SelectItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | number | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  const handleLoadMore = useCallback(() => {
    // Será implementado pelo usuário do hook
    // Exemplo: chamar API com offset = items.length
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setItems([]); // Limpar itens ao buscar
    setSelectedId(undefined);
  }, []);

  return {
    items,
    selectedId,
    searchQuery,
    isLoading,
    hasMore,
    setItems,
    setSelectedId,
    setSearchQuery,
    setIsLoading,
    setHasMore,
    handleLoadMore,
    handleSearch,
  };
}
