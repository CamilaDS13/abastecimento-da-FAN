import { FuelType } from '../types/fuel';

export function formatCurrency(value: number): string {
  if (isNaN(value) || !isFinite(value)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatNumber(value: number, decimals: number = 2): string {
  if (isNaN(value) || !isFinite(value)) return '0';
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const parts = dateString.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  }
  return dateString;
}

export function formatDateShort(dateString: string): string {
  if (!dateString) return '';
  const parts = dateString.split('-');
  if (parts.length === 3) {
    const [, month, day] = parts;
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const monthIdx = parseInt(month, 10) - 1;
    return `${day} ${months[monthIdx] || month}`;
  }
  return dateString;
}

export const FUEL_TYPE_LABELS: Record<FuelType, string> = {
  gasolina_comum: 'Gasolina Comum',
  gasolina_aditivada: 'Gasolina Aditivada',
  etanol: 'Etanol',
  diesel: 'Diesel',
  gnv: 'GNV',
};

export const FUEL_TYPE_COLORS: Record<FuelType, { bg: string; text: string; border: string }> = {
  gasolina_comum: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/20',
  },
  gasolina_aditivada: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/20',
  },
  etanol: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    border: 'border-blue-500/20',
  },
  diesel: {
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    border: 'border-purple-500/20',
  },
  gnv: {
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-400',
    border: 'border-cyan-500/20',
  },
};
