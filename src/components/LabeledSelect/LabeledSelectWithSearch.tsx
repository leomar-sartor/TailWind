import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronDown, Loader, Search as SearchIcon } from 'lucide-react';
import type { FieldError, UseFormRegisterReturn } from 'react-hook-form';
import type { SelectItem } from '../Select/SelectWithSearch';

type LabeledSelectWithSearchProps = {
  label: string;
  required?: boolean;
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
  className?: string;
  disabled?: boolean;
};

export function LabeledSelectWithSearch({
  label,
  required = false,
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
  className,
  disabled = false,
}: LabeledSelectWithSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedItem = items.find((item) => String(item.id) === String(selectedId));
  const hasError = !!error;
  const fieldId = registration?.name;

  const handleListScroll = useCallback(() => {
    if (!listRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 50;

    if (isNearBottom && hasMore && !isLoading && onLoadMore) {
      onLoadMore();
    }
  }, [hasMore, isLoading, onLoadMore]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 0);
    }
  }, [isOpen]);

  function handleItemSelect(item: SelectItem) {
    onChange(item);
    setIsOpen(false);
    setSearchQuery('');

    if (registration) {
      registration.onChange({
        target: {
          name: registration.name,
          value: String(item.id),
        },
        type: 'change',
      } as unknown as Parameters<typeof registration.onChange>[0]);
    }
  }

  function handleSearchChange(event: React.ChangeEvent<HTMLInputElement>) {
    const query = event.target.value;
    setSearchQuery(query);
    onSearch?.(query);
  }

  return (
    <div ref={dropdownRef} className={['relative space-y-2', className].filter(Boolean).join(' ')}>
      <label htmlFor={fieldId} className="block text-sm font-semibold text-[#2B2C40]">
        {label}
        {required ? <span aria-hidden="true">*</span> : null}
      </label>

      <button
        id={fieldId}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-invalid={hasError}
        aria-required={required}
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          setIsOpen((current) => !current);
        }}
        className={[
          'flex h-10 w-full items-center justify-between rounded-md border bg-white px-3 text-left text-sm text-[#2B2C40] shadow-sm outline-none transition',
          'focus:border-[#2F80ED] focus:ring-2 focus:ring-[#2F80ED]/15',
          isOpen ? 'border-[#2F80ED] ring-2 ring-[#2F80ED]/15' : '',
          hasError ? 'border-red-500 ring-red-500/15' : 'border-[#D9DEE3]',
          disabled ? 'cursor-not-allowed bg-[#F4F6FA] opacity-70' : '',
        ].join(' ')}
      >
        <span className={selectedItem ? 'text-[#2B2C40]' : 'text-[#A8AFBD]'}>
          {selectedItem?.label ?? placeholder}
        </span>
        <span className="ml-3 flex h-6 w-8 items-center justify-center border-l border-[#D9DEE3] text-[#646E78]">
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </span>
      </button>

      {isOpen ? (
        <div className="absolute left-0 right-0 z-50 mt-1 overflow-hidden rounded-b-md border border-[#D9DEE3] bg-white shadow-lg">
          <div className="border-b border-[#D9DEE3] bg-white p-2">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8B91A5]" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={handleSearchChange}
                className="h-9 w-full rounded-md border border-[#D9DEE3] pl-9 pr-3 text-sm outline-none focus:border-[#2F80ED] focus:ring-2 focus:ring-[#2F80ED]/15"
              />
            </div>
          </div>

          <ul ref={listRef} onScroll={handleListScroll} role="listbox" className="max-h-64 overflow-y-auto">
            {items.length > 0 ? (
              items.map((item, index) => {
                const isSelected = String(item.id) === String(selectedId);

                return (
                  <li key={item.id} role="option" aria-selected={isSelected}>
                    <button
                      type="button"
                      onClick={() => handleItemSelect(item)}
                      className={[
                        'block w-full px-3 py-2.5 text-left text-sm font-medium text-white transition-colors',
                        isSelected ? 'bg-[#2F80ED]' : index % 2 === 0 ? 'bg-[#2F80ED]' : 'bg-[#5A60C8]',
                        !isSelected ? 'hover:bg-[#256DD1]' : '',
                      ].join(' ')}
                    >
                      {item.label}
                    </button>
                  </li>
                );
              })
            ) : (
              <li className="px-3 py-6 text-center text-sm text-[#6C7287]">
                {isLoading ? 'Carregando...' : 'Nenhum resultado encontrado'}
              </li>
            )}

            {isLoading && items.length > 0 ? (
              <li className="bg-white px-3 py-3 text-center">
                <Loader className="mx-auto h-4 w-4 animate-spin text-[#2F80ED]" />
              </li>
            ) : null}

            {hasMore && !isLoading ? (
              <li className="bg-white px-3 py-2 text-center text-xs text-[#6C7287]">
                Role para carregar mais
              </li>
            ) : null}
          </ul>
        </div>
      ) : null}

      {registration ? (
        <input
          type="hidden"
          ref={registration.ref}
          name={registration.name}
          value={selectedId ?? ''}
          onBlur={registration.onBlur}
          onChange={() => {}}
        />
      ) : null}

      {hasError ? (
        <span className="block text-sm text-red-500">
          {error?.message}
        </span>
      ) : null}
    </div>
  );
}
