/**
 * Enhanced Bengali Date and Time formatting utilities
 * Provides robust error handling and fallback formatting
 */

const BENGALI_NUMBERS: { [key: string]: string } = {
  '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
  '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
};

const BENGALI_MONTHS = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

function toBengaliNumbers(num: string | number): string {
  return String(num).replace(/[0-9]/g, (digit) => BENGALI_NUMBERS[digit] || digit);
}

// Export for external use
export const toBengaliNumber = toBengaliNumbers;

function isValidDate(date: any): boolean {
  if (!date) return false;
  
  const parsedDate = new Date(date);
  return parsedDate instanceof Date && !isNaN(parsedDate.getTime());
}

function parseDate(dateInput: any): Date | null {
  // Early exit for null/undefined/empty values without logging
  if (!dateInput || dateInput === null || dateInput === undefined || dateInput === '' || dateInput === 'null' || dateInput === 'undefined') {
    return null;
  }
  
  // If it's already a Date object
  if (dateInput instanceof Date) {
    return isValidDate(dateInput) ? dateInput : null;
  }
  
  // If it's a string or number
  const parsed = new Date(dateInput);
  if (isValidDate(parsed)) {
    return parsed;
  }
  
  // Only log for genuinely unexpected invalid formats
  console.warn('[Date] Invalid date input:', dateInput, 'Type:', typeof dateInput);
  return null;
}

export function formatDateInBengali(dateInput: any): string {
  try {
    const date = parseDate(dateInput);
    
    if (!date) {
      // Silent fallback for null/undefined values - no error logging
      return 'অজানা তারিখ'; // "Unknown date" in Bengali
    }
    
    const day = toBengaliNumbers(date.getDate());
    const month = BENGALI_MONTHS[date.getMonth()];
    const year = toBengaliNumbers(date.getFullYear());
    
    return `${day} ${month}, ${year}`;
  } catch (error) {
    console.error('[Date] Error formatting Bengali date:', error, 'Input:', dateInput);
    return 'অজানা তারিখ';
  }
}

// Alias for backward compatibility
export const formatBengaliDate = formatDateInBengali;

export function getRelativeTimeInBengali(dateInput: any): string {
  try {
    const date = parseDate(dateInput);
    
    if (!date) {
      // Silent fallback for null/undefined values - no error logging
      return 'কিছুক্ষণ আগে'; // "A while ago" in Bengali
    }
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    // Handle future dates (edge case)
    if (diffMs < 0) {
      return 'সম্প্রতি'; // "Recently" in Bengali
    }
    
    if (diffMinutes < 1) {
      return 'এইমাত্র'; // "Just now"
    } else if (diffMinutes < 60) {
      return `${toBengaliNumbers(diffMinutes)} মিনিট আগে`;
    } else if (diffHours < 24) {
      return `${toBengaliNumbers(diffHours)} ঘণ্টা আগে`;
    } else if (diffDays < 7) {
      return `${toBengaliNumbers(diffDays)} দিন আগে`;
    } else {
      // For older dates, show formatted date
      return formatDateInBengali(date);
    }
  } catch (error) {
    console.error('[Date] Error calculating relative time:', error, 'Input:', dateInput);
    return 'কিছুক্ষণ আগে';
  }
}

export function formatTimeInBengali(dateInput: any): string {
  try {
    const date = parseDate(dateInput);
    
    if (!date) {
      // Silent fallback for null/undefined values - no error logging
      return 'অজানা সময়'; // "Unknown time" in Bengali
    }
    
    const hours = date.getHours();
    const minutes = date.getMinutes();
    
    const bengaliHours = toBengaliNumbers(hours > 12 ? hours - 12 : hours === 0 ? 12 : hours);
    const bengaliMinutes = toBengaliNumbers(minutes.toString().padStart(2, '0'));
    const period = hours >= 12 ? 'রাত' : 'সকাল';
    
    return `${bengaliHours}:${bengaliMinutes} ${period}`;
  } catch (error) {
    console.error('[Date] Error formatting Bengali time:', error, 'Input:', dateInput);
    return 'অজানা সময়';
  }
}

// Enhanced date parsing for different input formats
export function parseAndValidateDate(dateInput: any): {
  isValid: boolean;
  date: Date | null;
  error?: string;
} {
  try {
    if (!dateInput) {
      return {
        isValid: false,
        date: null,
        error: 'No date input provided'
      };
    }
    
    const parsed = parseDate(dateInput);
    
    if (!parsed) {
      return {
        isValid: false,
        date: null,
        error: `Unable to parse date: ${dateInput}`
      };
    }
    
    return {
      isValid: true,
      date: parsed
    };
  } catch (error) {
    return {
      isValid: false,
      date: null,
      error: `Error parsing date: ${error}`
    };
  }
}

// Utility for debugging date issues
export function debugDate(dateInput: any, context: string = 'unknown'): void {
  console.log(`[Date Debug - ${context}]`, {
    input: dateInput,
    type: typeof dateInput,
    isValid: isValidDate(dateInput),
    parsed: parseDate(dateInput),
    formatted: formatDateInBengali(dateInput),
    relative: getRelativeTimeInBengali(dateInput)
  });
}