export function formatCurrency(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') return '';
  const normalized = typeof value === 'string' ? value.replace(/,/g, '') : String(value);
  const parsed = Number(normalized);
  if (Number.isNaN(parsed) || parsed === 0) return '';
  return parsed.toLocaleString('en-US');
}

export function parseCurrencyInput(value: string): number {
  const digits = value.replace(/[^0-9]/g, '');
  return digits ? Number(digits) : 0;
}
