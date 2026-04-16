import { InputVariant, InputSize } from "./input.types";
import { inputVariants, inputSizes } from "./input.styles";
import { FieldError, UseFormRegisterReturn } from "react-hook-form";
import { useState } from 'react';
import { Eye, EyeOff } from "lucide-react"

type InputProps = {
  variant?: InputVariant,
  sizeInput?: InputSize,
  registration?: UseFormRegisterReturn; // ref + name + onChange + onBlur
  icon?: React.ReactNode;
  error?: FieldError;
} & React.ComponentProps<'input'>;
export function Input({
  variant = 'primary-green',
  sizeInput = 'xl',
  className,
  registration,
  type,
  icon,
  error,
  ...props
}: InputProps) {

  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isFilled, setIsFilled] = useState(false);

  const isPassword = type === "password";
  const hasError = !!error;
  const { onChange, onBlur, name, ref } = registration || {};

  function handleInputFocus() {
    console.log("handleInputFocus", new Date().toLocaleTimeString());
    setIsFocused(true);
  }

  function handleInputBlur(e: React.FocusEvent<HTMLInputElement>) {
    console.log("handleInputBlur", new Date().toLocaleTimeString());
    setIsFocused(false);
    setIsFilled(e.target.value.length > 0);
  }

  const iconColor = hasError
    ? "text-red-500"
    : (isFocused || isFilled
      ? "text-[#696CFF]"
      : "text-gray-400");

  return (
    <>
      <div className="relative mt-6 mb-2">

        {/* ÍCONE ESQUERDA */}
        {!isPassword && icon && (
          <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${iconColor} transition-colors duration-200`}>
            {icon}
          </span>
        )}

        <input
          ref={ref}
          name={name}
          className={[
            inputVariants[variant],
            inputSizes[sizeInput],
            !isPassword && icon ? "pl-10" : "",
            hasError ? "border-red-500 focus:border-red-500" : (isFocused || isFilled) ? "border-[#696CFF] focus:border-[#696CFF]" : "",
            className,
          ].join(' ')}
          onFocus={handleInputFocus}
          onBlur={(e) => {
            handleInputBlur(e);
            onBlur?.(e);
          }}
          onChange={(e) => {
            setIsFilled(e.target.value.length > 0);
            onChange?.(e);
          }}
          type={isPassword && showPassword ? 'text' : type}
          {...props}
        />

        {/* ÍCONE DIREITA */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(prev => !prev)}
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center justify-center ${iconColor}  transition-colors duration-200`}
          >
            {showPassword ? (
              <EyeOff size={18} />
            ) : (
              <Eye size={18} />
            )}
          </button>
        )}

      </div>

      {
        hasError && (
          <span className="text-red-500 text-sm ms-2 block">
            {error?.message}
          </span>
        )
      }
    </>
  );
}