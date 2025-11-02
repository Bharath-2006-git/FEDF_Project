/**
 * Format emission value with appropriate unit (always in kg)
 */
export function formatEmissionValue(value: number): string {
  return `${value.toFixed(1)} kg`;
}

/**
 * Format date to readable string
 */
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  };
  return new Date(date).toLocaleDateString('en-US', defaultOptions);
}

/**
 * Calculate percentage change
 */
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Get trend direction and percentage
 */
export function getTrend(current: number, previous: number) {
  const trend = Math.abs(calculatePercentageChange(current, previous));
  const isPositive = current < previous; // Lower emissions is positive
  return { trend, isPositive };
}
