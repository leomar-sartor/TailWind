import type { InputSize, InputVariant } from './input.types'

export const inputVariants: Record<InputVariant, string> = {
  "primary-green": 'input input-primary-green',
  destructive: 'input input-destructive',
}

export const inputSizes: Record<InputSize, string> = {
  sm: 'input-sm',
  md: 'input-md',
  lg: 'input-lg',
  xl: 'input-xl',
}