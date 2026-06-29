import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { FieldError, UseFormRegisterReturn } from 'react-hook-form';

export type LabeledSelectOption = {
  value: string | number;
  label: string;
};

type LabeledSelectProps = {
  label: string;
  required?: boolean;
  options: LabeledSelectOption[];
  value?: string | number;
  defaultValue?: string | number;
  placeholder?: string;
  registration?: UseFormRegisterReturn;
  error?: FieldError;
  onChange?: (option: LabeledSelectOption) => void;
  className?: string;
};

export function LabeledSelect({
  label,
  required = false,
  options,
  value,
  defaultValue = '',
  placeholder = 'Selecione uma opção',
  registration,
  error,
  onChange,
  className,
}: LabeledSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [internalValue, setInternalValue] = useState<string | number>(value ?? defaultValue);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedValue = value ?? internalValue;
  const selectedOption = options.find((option) => String(option.value) === String(selectedValue));
  const hasError = !!error;
  const fieldId = registration?.name;

  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  function handleSelect(option: LabeledSelectOption) {
    setInternalValue(option.value);
    setIsOpen(false);
    onChange?.(option);

    if (registration) {
      registration.onChange({
        target: {
          name: registration.name,
          value: String(option.value),
        },
        type: 'change',
      } as unknown as Parameters<typeof registration.onChange>[0]);
    }
  }

  return (
    <div ref={wrapperRef} className={['relative space-y-2', className].filter(Boolean).join(' ')}>
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
        onClick={() => setIsOpen((current) => !current)}
        className={[
          'flex h-10 w-full items-center justify-between rounded-md border bg-white px-3 text-left text-sm text-[#2B2C40] shadow-sm outline-none transition',
          'focus:border-[#2F80ED] focus:ring-2 focus:ring-[#2F80ED]/15',
          isOpen ? 'border-[#2F80ED] ring-2 ring-[#2F80ED]/15' : '',
          hasError ? 'border-red-500 ring-red-500/15' : 'border-[#D9DEE3]',
        ].join(' ')}
      >
        <span className={selectedOption ? 'text-[#2B2C40]' : 'text-[#A8AFBD]'}>
          {selectedOption?.label ?? placeholder}
        </span>
        <span className="ml-3 flex h-6 w-8 items-center justify-center border-l border-[#D9DEE3] text-[#646E78]">
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </span>
      </button>

      {isOpen ? (
        <ul
          role="listbox"
          className="absolute left-0 right-0 z-50 mt-1 overflow-hidden rounded-b-md border border-[#D9DEE3] bg-white shadow-lg"
        >
          {options.map((option, index) => {
            const isSelected = String(option.value) === String(selectedValue);

            return (
              <li key={option.value} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  onClick={() => handleSelect(option)}
                  className={[
                    'block w-full px-3 py-2.5 text-left text-sm font-medium text-white transition-colors',
                    isSelected ? 'bg-[#2F80ED]' : index % 2 === 0 ? 'bg-[#2F80ED]' : 'bg-[#5A60C8]',
                    !isSelected ? 'hover:bg-[#256DD1]' : '',
                  ].join(' ')}
                >
                  {option.label}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      {registration ? (
        <input
          type="hidden"
          ref={registration.ref}
          name={registration.name}
          value={String(selectedValue)}
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
