/**
 * Utility functions for formatting values in the application
 */

/**
 * Format a number as Vietnamese Dong (VND) currency
 * @param value - The numeric value to format
 * @returns Formatted currency string (e.g., "1,234,567 ₫")
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

/**
 * Parse a currency string back to a number
 * @param value - The currency string to parse (e.g., "1,234,567 ₫")
 * @returns The parsed number (e.g., 1234567)
 */
export const parseCurrency = (value: string): number => {
  const number = value.replace(/[^\d]/g, '');
  return number ? parseInt(number, 10) : 0;
};
