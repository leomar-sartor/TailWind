# SelectWithSearch - Componente com Busca e Paginação Infinita

## Características

✅ Busca embutida no dropdown
✅ Paginação infinita (lazy loading)
✅ Carrega 10 em 10 registros quando rolar ao fim
✅ Compatível com react-hook-form
✅ Ícone ChevronDown que muda de cor conforme o estado
✅ Design consistente com o restante do projeto

## Como Usar

### 1. **Uso Básico (Sem Paginação)**

```tsx
import { SelectWithSearch, SelectItem } from '@/components/Select/SelectWithSearch';

export function MyComponent() {
  const items: SelectItem[] = [
    { id: '1', label: 'Opção 1' },
    { id: '2', label: 'Opção 2' },
    { id: '3', label: 'Opção 3' },
  ];

  const [selected, setSelected] = useState<string | number>();

  return (
    <SelectWithSearch
      items={items}
      selectedId={selected}
      placeholder="Selecione uma opção"
      onChange={(item) => setSelected(item.id)}
    />
  );
}
```

### 2. **Uso com Paginação Infinita e Busca**

```tsx
import { useQuery } from '@apollo/client';
import { useForm } from 'react-hook-form';
import { SelectWithSearch } from '@/components/Select/SelectWithSearch';
import { GET_EMPRESAS_PAGINATED } from '@/graphql/queries/setor.queries';

export function SetorPageComSelect() {
  const form = useForm();
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState();

  const { data, loading, fetchMore } = useQuery(GET_EMPRESAS_PAGINATED, {
    variables: {
      first: 10,
      where: searchQuery ? { razaoSocial: { contains: searchQuery } } : null,
    },
  });

  // Carregar itens iniciais
  useEffect(() => {
    if (data?.empresas?.nodes) {
      setItems(
        data.empresas.nodes.map((emp) => ({
          id: emp.id,
          label: emp.razaoSocial,
        }))
      );
    }
  }, [data]);

  const handleLoadMore = async () => {
    const hasMore = data?.empresas?.pageInfo?.hasNextPage;
    const endCursor = data?.empresas?.pageInfo?.endCursor;

    if (!hasMore) return;

    await fetchMore({
      variables: {
        first: 10,
        after: endCursor,
        where: searchQuery ? { razaoSocial: { contains: searchQuery } } : null,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        const newItems = fetchMoreResult.empresas.nodes.map((emp) => ({
          id: emp.id,
          label: emp.razaoSocial,
        }));
        setItems((prev) => [...prev, ...newItems]);
        return fetchMoreResult;
      },
    });
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setItems([]);
  };

  return (
    <SelectWithSearch
      items={items}
      selectedId={selectedId}
      placeholder="Selecione uma empresa"
      searchPlaceholder="Buscar empresa..."
      isLoading={loading}
      hasMore={data?.empresas?.pageInfo?.hasNextPage}
      onLoadMore={handleLoadMore}
      onSearch={handleSearch}
      onChange={(item) => setSelectedId(item.id)}
    />
  );
}
```

### 3. **Uso com react-hook-form**

```tsx
const form = useForm();

<SelectWithSearch
  items={items}
  selectedId={form.watch('empresaId')}
  onChange={(item) => form.setValue('empresaId', item.id)}
  registration={form.register('empresaId')}
  error={form.formState.errors.empresaId}
/>
```

## Props

| Prop | Tipo | Obrigatório | Descrição |
|------|------|------------|-----------|
| `items` | `SelectItem[]` | Sim | Array de itens com `id` e `label` |
| `selectedId` | `string \| number` | Não | ID do item selecionado |
| `placeholder` | `string` | Não | Texto padrão (default: "Selecione uma opção") |
| `searchPlaceholder` | `string` | Não | Placeholder do input de busca |
| `isLoading` | `boolean` | Não | Se está carregando |
| `hasMore` | `boolean` | Não | Se há mais dados para carregar |
| `onLoadMore` | `() => void` | Não | Callback ao rolar ao fim da lista |
| `onSearch` | `(query: string) => void` | Não | Callback ao digitar na busca |
| `onChange` | `(item: SelectItem) => void` | Sim | Callback ao selecionar item |
| `registration` | `UseFormRegisterReturn` | Não | Integração com react-hook-form |
| `error` | `FieldError` | Não | Erro do campo (react-hook-form) |

## Comportamento

1. **Ao Abrir o Dropdown**: 
   - Mostra os primeiros 10 itens
   - Input de busca recebe foco automático

2. **Ao Digitar na Busca**:
   - Chama `onSearch(query)`
   - Você é responsável por fazer a chamada GraphQL com o novo filtro
   - Lista é limpa e recarregada com novos resultados

3. **Ao Rolar ao Fim**:
   - Detecta automaticamente quando o usuário chegou ao fim (50px antes do fim)
   - Chama `onLoadMore()`
   - Você é responsável por chamar `fetchMore` do Apollo Client
   - Novos itens são adicionados ao final da lista

4. **Visual**:
   - Ícone chevron muda de cor: cinza (padrão) → azul (focado/preenchido) → vermelho (erro)
   - Ícone gira quando o dropdown está aberto
   - Item selecionado fica destacado em azul com fundo claro

## Exemplo Completo com Paginação

Ver: [ExampleSelectWithPagination.tsx](./ExampleSelectWithPagination.tsx)

## Instalação

Este componente já está disponível em:
```
src/components/Select/SelectWithSearch.tsx
```

Para usar em qualquer página:
```tsx
import { SelectWithSearch } from '@/components/Select/SelectWithSearch';
```
