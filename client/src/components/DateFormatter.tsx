/**
 * Centralized date formatting component for Bengali dates
 */
import { getRelativeTimeInBengali, formatBengaliDate } from '@/lib/utils/dates';

interface DateFormatterProps {
  date: string | Date | number;
  type?: 'relative' | 'full';
  fallback?: string;
}

export const DateFormatter = ({ 
  date, 
  type = 'relative', 
  fallback = 'অজানা সময়' 
}: DateFormatterProps) => {
  try {
    if (!date || date === null || date === undefined || date === 'null' || date === '') {
      return fallback;
    }
    
    if (type === 'relative') {
      return getRelativeTimeInBengali(date);
    } else {
      return formatBengaliDate(date);
    }
  } catch (error) {
    console.error('Date formatting error:', error);
    return fallback;
  }
};

// Utility function for formatting dates
export const formatDate = (date: string | Date | number, type: 'relative' | 'full' = 'relative'): string => {
  try {
    if (!date || date === null || date === undefined || date === 'null' || date === '') {
      return 'অজানা সময়';
    }
    
    if (type === 'relative') {
      return getRelativeTimeInBengali(date);
    } else {
      return formatBengaliDate(date);
    }
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'অজানা সময়';
  }
};

export default DateFormatter;