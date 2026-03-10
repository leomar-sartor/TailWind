import { InputVariant, InputSize } from "./input.types";
import { inputVariants, inputSizes } from "./input.styles";

type InputProps = {
  variant?: InputVariant,
  sizeInput?: InputSize,
  
} & React.ComponentProps<'input'>
  & React.HTMLAttributes<HTMLInputElement>;

export function Input({
  variant = 'primary-green',
  sizeInput = 'xl',
  className,
  ...props
}: InputProps) {
  return (
    <input className={[
      inputVariants[variant],
      inputSizes[sizeInput],
      className,
    ].join(' ')}
      {...props}
    >
    </input>
  )
}