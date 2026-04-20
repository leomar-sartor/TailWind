import type { SelectSize, SelectVariant } from './select.types'

export const selectVariants: Record<SelectVariant, string> = {
  "primary-green": 'select select-primary-green',
  destructive: 'select select-destructive',
}

export const selectSizes: Record<SelectSize, string> = {
  sm: 'select-sm',
  md: 'select-md',
  lg: 'select-lg',
  xl: 'select-xl',
}
