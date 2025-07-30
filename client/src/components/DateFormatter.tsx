/**
 * Centralized date formatting component for Bengali dates
 * Fixed for accurate timestamp calculations
 */
import { getRelativeTimeInBengali, formatBengaliDate, normalizeSupabaseTimestamp, debugTimestamp } from '@/lib/utils/dates';

interface DateFormatterProps {
  date: string | Date | number;
  type?: 'relative' | 'full';
  fallback?: string;
  debug?: boolean;
}

export const DateFormatter = ({ 
  date, 
  type = 'relative', 
  fallback = 'অজানা সময়',
  debug = false
}: DateFormatterProps) => {
  try {
    if (!date || date === null || date === undefined || date === 'null' || date === '') {
      return fallback;
    }
    
    // Debug timestamp if requested
    if (debug) {
      debugTimestamp(date, 'DateFormatter Input');
    }
    
    // Normalize the timestamp for consistent handling
    const normalizedDate = typeof date === 'string' ? normalizeSupabaseTimestamp(date) : date;
    
    if (type === 'relative') {
      return getRelativeTimeInBengali(normalizedDate);
    } else {
      return formatBengaliDate(normalizedDate);
    }
  } catch (error) {
    console.error('Date formatting error:', error, { date, type });
    return fallback;
  }
};

// Utility function for formatting dates - Updated with better timestamp handling
export const formatDate = (date: string | Date | number, type: 'relative' | 'full' = 'relative'): string => {
  try {
    if (!date || date === null || date === undefined || date === 'null' || date === '') {
      return 'অজানা সময়';
    }
    
    // Normalize the timestamp for consistent handling
    const normalizedDate = typeof date === 'string' ? normalizeSupabaseTimestamp(date) : date;
    
    if (type === 'relative') {
      return getRelativeTimeInBengali(normalizedDate);
    } else {
      return formatBengaliDate(normalizedDate);
    }
  } catch (error) {
    console.error('Date formatting error:', error, { date, type });
    return 'অজানা সময়';
  }
};;

export default DateFormatter;