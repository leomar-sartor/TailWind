import { useState, useRef, useCallback, useEffect } from 'react';
import { ChevronDown, Search as SearchIcon, Loader } from 'lucide-react';
import { FieldError, UseFormRegisterReturn } from 'react-hook-form';

export type SelectItem = {
  id: string | number;
  label: string;
};

type SelectWithSearchProps = {
  items: SelectItem[];
  selectedId?: string | number;
  placeholder?: string;
  searchPlaceholder?: string;
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onSearch?: (query: string) => void;
  onChange: (item: SelectItem) => void;
  registration?: UseFormRegisterReturn;
  error?: FieldError;
};

export function SelectWithSearch({
  items = [],
  selectedId,
  placeholder = 'Selecione uma opção',
  searchPlaceholder = 'Buscar...',
  isLoading = false,
  hasMore = false,
  onLoadMore,
  onSearch,
  onChange,
  registration,
  error,
}: SelectWithSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isFilled, setIsFilled] = useState(!!selectedId);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedItem = items.find((item) => item.id === selectedId);

  const hasError = !!error;
  const iconColor = hasError
    ? 'text-red-500'
    : isFocused || isFilled
      ? 'text-[#696CFF]'
      : 'text-gray-400';

  // Detectar scroll ao fim da lista
  const handleListScroll = useCallback(() => {
    if (!listRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 50;

    if (isNearBottom && hasMore && !isLoading && onLoadMore) {
      onLoadMore();
    }
  }, [hasMore, isLoading, onLoadMore]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Focus no input de busca quando abre
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 0);
    }
  }, [isOpen]);

  const handleItemSelect = (item: SelectItem) => {
    onChange(item);
    setIsFilled(true);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch?.(query);
  };

  return (
    <div className="relative mt-6 mb-2">
      <div ref={dropdownRef} className="relative">
        {/* Trigger Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`w-full flex items-center justify-between rounded-2xl border p-4 h-14 text-base bg-[#FEF9C3] border-[#CBD5E1] text-[#111827] focus-visible:ring-[#696CFF] focus-visible:ring-3 focus-visible:ring-offset-2 focus-visible:outline-none transition-colors ${
            hasError ? 'border-red-500' : isFocused || isFilled ? 'border-[#696CFF]' : ''
          }`}
        >
          <span className="text-[#111827]">
            {selectedItem ? selectedItem.label : placeholder}
          </span>
          <ChevronDown
            className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''} ${iconColor}`}
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl border border-[#CBD5E1] bg-white shadow-lg z-50">
            {/* Search Input */}
            <div className="sticky top-0 border-b border-[#CBD5E1] bg-white p-3 rounded-t-2xl">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#CBD5E1] text-sm focus:outline-none focus:border-[#696CFF] focus:ring-1 focus:ring-[#696CFF]"
                />
              </div>
            </div>

            {/* Items List */}
            <ul
              ref={listRef}
              onScroll={handleListScroll}
              className="max-h-64 overflow-y-auto"
            >
              {items.length > 0 ? (
                items.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => handleItemSelect(item)}
                      className={`w-full px-4 py-3 text-left text-sm transition-colors hover:bg-[#F4F6FA] ${
                        selectedId === item.id
                          ? 'bg-[#696CFF]/10 text-[#696CFF] font-semibold'
                          : 'text-[#2B2C40]'
                      }`}
                    >
                      {item.label}
                    </button>
                  </li>
                ))
              ) : (
                <li className="px-4 py-8 text-center text-sm text-[#6C7287]">
                  {isLoading ? 'Carregando...' : 'Nenhum resultado encontrado'}
                </li>
              )}

              {/* Loading indicator */}
              {isLoading && items.length > 0 && (
                <li className="px-4 py-3 text-center">
                  <Loader className="h-4 w-4 animate-spin text-[#696CFF] mx-auto" />
                </li>
              )}

              {/* Load more hint */}
              {hasMore && !isLoading && (
                <li className="px-4 py-2 text-center text-xs text-[#6C7287]">
                  Role para carregar mais
                </li>
              )}
            </ul>
          </div>
        )}
      </div>

      {/* Hidden input for form integration */}
      {registration && (
        <input
          type="hidden"
          {...registration}
          value={selectedId ?? ''}
          onChange={() => {}} // Controlled by SelectWithSearch
        />
      )}

      {/* Error message */}
      {hasError && (
        <span className="text-red-500 text-sm mt-1 block">
          {error?.message}
        </span>
      )}
    </div>
  );
}
