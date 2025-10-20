import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a name string to proper case (first letter of each word capitalized)
 * and trims leading/trailing whitespace
 * @param name - The name string to format
 * @returns Formatted name string
 */
export function formatName(name: string): string {
  if (!name || typeof name !== 'string') return '';

  return name
    .trim() // Remove leading and trailing spaces
    .split(/\s+/) // Split by one or more whitespace characters
    .map(word =>
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join(' ');
}

/**
 * Formats an address string with first word capitalized and rest lowercase
 * and trims leading/trailing whitespace
 * @param address - The address string to format
 * @returns Formatted address string
 */
export function formatAddress(address: string): string {
  if (!address || typeof address !== 'string') return '';

  const trimmed = address.trim();
  if (!trimmed) return '';

  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
}

/**
 * Checks if a preference date represents "no date available"
 * The date 01/01/2000 is used as a placeholder to indicate no preference date
 * @param date - The date string to check (can be in various formats)
 * @returns true if the date is the "no preference" placeholder, false otherwise
 */
export function isNoPreferenceDate(date: string | undefined | null): boolean {
  if (!date || date === " ") return true;

  // Check for 01/01/2000 in various formats
  const noDateIndicators = [
    "01/01/2000",
    "1/1/2000",
    "2000-01-01",
    "2000-01-01T00:00:00.000Z",
    "2000-01-01T00:00:00Z",
  ];

  // Also check if the date string contains the year 2000 and month 01 and day 01
  try {
    const dateObj = new Date(date);
    if (dateObj.getFullYear() === 2000 &&
      dateObj.getMonth() === 0 &&
      dateObj.getDate() === 1) {
      return true;
    }
  } catch {
    // If date parsing fails, check against string patterns
  }

  return noDateIndicators.includes(date.trim());
}
