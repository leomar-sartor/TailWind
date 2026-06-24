export function stripCnpjMask(value: string | null | undefined) {
  return (value || '').replace(/[^a-zA-Z0-9]/g, '');
}

export function formatCnpj(value: string | null | undefined) {
  const chars = stripCnpjMask(value).slice(0, 14);
  if (!chars) return '';

  if (chars.length <= 2) return chars;
  if (chars.length <= 5) return `${chars.slice(0, 2)}.${chars.slice(2)}`;
  if (chars.length <= 8) return `${chars.slice(0, 2)}.${chars.slice(2, 5)}.${chars.slice(5)}`;
  if (chars.length <= 12) return `${chars.slice(0, 2)}.${chars.slice(2, 5)}.${chars.slice(5, 8)}/${chars.slice(8)}`;

  return `${chars.slice(0, 2)}.${chars.slice(2, 5)}.${chars.slice(5, 8)}/${chars.slice(8, 12)}-${chars.slice(12)}`;
}

export function formatCnpjForDisplay(value: string | null | undefined) {
  const chars = stripCnpjMask(value);
  if (chars.length !== 14) return value || '';
  return `${chars.slice(0, 2)}.${chars.slice(2, 5)}.${chars.slice(5, 8)}/${chars.slice(8, 12)}-${chars.slice(12)}`;
}
