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
