import { SelectVariant, SelectSize } from "./select.types";
import { selectVariants, selectSizes } from "./select.styles";
import { FieldError, UseFormRegisterReturn } from "react-hook-form";
import { useState } from 'react';
import { ChevronDown } from "lucide-react";

type SelectProps = {
  variant?: SelectVariant,
  sizeSelect?: SelectSize,
  registration?: UseFormRegisterReturn;
  error?: FieldError;
  children?: React.ReactNode;
} & React.ComponentProps<'select'>;

export function Select({
  variant = 'primary-green',
  sizeSelect = 'xl',
  className,
  registration,
  error,
  children,
  ...props
}: SelectProps) {

  const [isFocused, setIsFocused] = useState(false);
  const [isFilled, setIsFilled] = useState(false);

  const hasError = !!error;
  const { onChange, onBlur, name, ref } = registration || {};

  const iconColor = hasError
    ? "text-red-500"
    : (isFocused || isFilled
      ? "text-[#696CFF]"
      : "text-gray-400");

  function handleSelectFocus() {
    setIsFocused(true);
  }

  function handleSelectBlur(e: React.FocusEvent<HTMLSelectElement>) {
    setIsFocused(false);
    setIsFilled(e.target.value.length > 0);
  }

  return (
    <>
      <div className="relative mt-6 mb-2">
        {/* ARROW ICON */}
        <span className={`absolute right-3 top-1/2 -translate-y-1/2 ${iconColor} transition-colors duration-200 pointer-events-none`}>
          <ChevronDown className="h-5 w-5" />
        </span>

        <select
          ref={ref}
          name={name}
          className={[
            selectVariants[variant],
            selectSizes[sizeSelect],
            "pr-12",
            hasError ? "border-red-500 focus:border-red-500" : (isFocused || isFilled) ? "border-[#696CFF] focus:border-[#696CFF]" : "",
            className,
          ].join(' ')}
          onFocus={handleSelectFocus}
          onBlur={(e) => {
            handleSelectBlur(e);
            onBlur?.(e);
          }}
          onChange={(e) => {
            setIsFilled(e.target.value.length > 0);
            onChange?.(e);
          }}
          {...props}
        >
          {children}
        </select>
      </div>
      {hasError && (
        <span className="text-red-500 text-sm mt-1">
          {error?.message}
        </span>
      )}
    </>
  );
}
