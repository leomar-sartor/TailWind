import { InputVariant, InputSize } from "./input.types";
import { inputVariants, inputSizes } from "./input.styles";
import { UseFormRegisterReturn } from "react-hook-form";

type InputProps = {
  variant?: InputVariant,
  sizeInput?: InputSize,
  registration?: UseFormRegisterReturn; // ref + name + onChange + onBlur
} & React.ComponentProps<'input'>
  & React.HTMLAttributes<HTMLInputElement>;

export function Input({
  variant = 'primary-green',
  sizeInput = 'xl',
  className,
  registration,
  ...props
  
}: InputProps) {
  return (
    <input className={[
      inputVariants[variant],
      inputSizes[sizeInput],
      className,
    ].join(' ')}
      {...props}
      {...registration}
    >
    </input>
  )
}