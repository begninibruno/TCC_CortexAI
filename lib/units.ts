import type { UnidadeMedida } from './types';

export const UNIT_OPTIONS: Array<{ value: UnidadeMedida; label: string; short: string }> = [
  { value: 'unidade', label: 'Unidade', short: 'un.' },
  { value: 'kg', label: 'Quilograma (kg)', short: 'kg' },
  { value: 'litro', label: 'Litro (L)', short: 'L' },
  { value: 'kit', label: 'Kit', short: 'kit' },
];

export function normalizeUnit(value?: string | null): UnidadeMedida {
  return UNIT_OPTIONS.some((option) => option.value === value) ? value as UnidadeMedida : 'unidade';
}

export function unitShort(value?: string | null): string {
  return UNIT_OPTIONS.find((option) => option.value === normalizeUnit(value))?.short || 'un.';
}

export function quantityStep(value?: string | null): number {
  const unit = normalizeUnit(value);
  return unit === 'kg' || unit === 'litro' ? 0.1 : 1;
}

export function formatQuantity(value: number, unit?: string | null): string {
  const normalized = normalizeUnit(unit);
  const maximumFractionDigits = normalized === 'kg' || normalized === 'litro' ? 3 : 0;
  return `${Number(value || 0).toLocaleString('pt-BR', { maximumFractionDigits })} ${unitShort(normalized)}`;
}
