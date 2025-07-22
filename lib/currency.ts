/**
 * Format currency in Indonesian Rupiah with Indonesian number format
 * Example: 1000000 becomes "Rp 1.000.000,00"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Format number with Indonesian format (dots for thousands, comma for decimals)
 * Example: 1000000.50 becomes "1.000.000,50"
 */
export function formatNumber(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}