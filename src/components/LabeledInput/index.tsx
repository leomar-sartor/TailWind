import type { ComponentProps } from 'react';
import type { FieldError, UseFormRegisterReturn } from 'react-hook-form';

type LabeledInputProps = {
  label: string;
  required?: boolean;
  registration?: UseFormRegisterReturn;
  error?: FieldError;
} & ComponentProps<'input'>;

export function LabeledInput({
  label,
  required = false,
  registration,
  error,
  className,
  id,
  name,
  onBlur,
  onChange,
  ...props
}: LabeledInputProps) {
  const hasError = !!error;
  const fieldName = registration?.name ?? name;
  const fieldId = id ?? fieldName;

  return (
    <div className="space-y-2">
      <label htmlFor={fieldId} className="block text-sm font-semibold text-[#2B2C40]">
        {label}
        {required ? <span aria-hidden="true">*</span> : null}
      </label>

      <input
        id={fieldId}
        ref={registration?.ref}
        name={fieldName}
        className={[
          'w-full rounded-md border bg-white px-3 py-2.5 text-sm text-[#2B2C40] shadow-sm outline-none transition',
          'placeholder:text-[#A8AFBD]',
          'focus:border-[#696CFF] focus:ring-2 focus:ring-[#696CFF]/15',
          'disabled:cursor-not-allowed disabled:bg-[#F4F6FA] disabled:text-[#8B91A5]',
          hasError ? 'border-red-500 focus:border-red-500 focus:ring-red-500/15' : 'border-[#D9DEE3]',
          className,
        ].join(' ')}
        aria-invalid={hasError}
        aria-required={required}
        onBlur={(event) => {
          registration?.onBlur(event);
          onBlur?.(event);
        }}
        onChange={(event) => {
          registration?.onChange(event);
          onChange?.(event);
        }}
        {...props}
      />

      {hasError ? (
        <span className="block text-sm text-red-500">
          {error?.message}
        </span>
      ) : null}
    </div>
  );
}
