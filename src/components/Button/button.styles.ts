import type { ButtonVariant, ButtonSize } from './button.types'

export const buttonVariants: Record<ButtonVariant, string> = {
  "primary-green": 'btn btn-primary-green',
  destructive: 'btn btn-destructive',
  secondary: 'btn btn-secondary',
}

export const buttonSizes: Record<ButtonSize, string> = {
  sm: 'btn-sm',
  md: 'btn-md',
  lg: 'btn-lg',
  xl: 'btn-xl',
}
