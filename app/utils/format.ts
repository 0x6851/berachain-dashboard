/**
 * Formats a number with appropriate precision and separators
 * @param value - The number to format
 * @param options - Formatting options
 * @returns Formatted number string
 */
export function formatNumber(
  value: number | null | undefined,
  options: {
    decimals?: number;
    prefix?: string;
    suffix?: string;
    compact?: boolean;
  } = {}
): string {
  if (value === null || value === undefined) return '-';

  const {
    decimals = 2,
    prefix = '',
    suffix = '',
    compact = false,
  } = options;

  const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
    notation: compact ? 'compact' : 'standard',
    compactDisplay: 'short',
  });

  return `${prefix}${formatter.format(value)}${suffix}`;
}

/**
 * Formats a currency value with appropriate precision and currency symbol
 * @param value - The number to format
 * @param options - Formatting options
 * @returns Formatted currency string
 */
export function formatCurrency(
  value: number | null | undefined,
  options: {
    decimals?: number;
    currency?: string;
    compact?: boolean;
  } = {}
): string {
  if (value === null || value === undefined) return '-';

  const {
    decimals = 2,
    currency = 'USD',
    compact = false,
  } = options;

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
    notation: compact ? 'compact' : 'standard',
    compactDisplay: 'short',
  });

  return formatter.format(value);
} 