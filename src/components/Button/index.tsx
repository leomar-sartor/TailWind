import type { ButtonVariant, ButtonSize } from './button.types'
import { buttonVariants, buttonSizes } from './button.styles'

type ButtonProps = {
  variant?: ButtonVariant,
  size?: ButtonSize,
} & React.ComponentProps<'button'>
& React.HTMLAttributes<HTMLButtonElement>;

export function Button({
  variant = 'primary-green',
  size = 'xl',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={[
        buttonVariants[variant],
        buttonSizes[size],
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  )
}