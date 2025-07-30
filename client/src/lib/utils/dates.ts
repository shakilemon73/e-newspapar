// Bengali date formatting utilities - Fixed timestamp calculation
export const getRelativeTimeInBengali = (dateString: string | Date | number): string => {
  if (!dateString) return 'কিছুক্ষণ আগে';
  
  try {
    // Handle different input types
    let date: Date;
    if (dateString instanceof Date) {
      date = dateString;
    } else if (typeof dateString === 'number') {
      date = new Date(dateString);
    } else if (typeof dateString === 'string') {
      // Handle ISO strings and various formats
      date = new Date(dateString);
      
      // If the date string doesn't have timezone info, treat it as UTC
      if (dateString.includes('T') && !dateString.includes('Z') && !dateString.includes('+')) {
        date = new Date(dateString + 'Z');
      }
    } else {
      return 'কিছুক্ষণ আগে';
    }
    
    if (isNaN(date.getTime())) return 'কিছুক্ষণ আগে';
    
    // Use UTC time for consistent calculations
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    
    // Handle future dates (shouldn't happen but just in case)
    if (diffMs < 0) return 'ভবিষ্যতে';
    
    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30.44); // More accurate month calculation
    const years = Math.floor(days / 365.25); // More accurate year calculation

    if (years >= 2) {
      return `${toBengaliNumber(years)} বছর আগে`;
    } else if (years === 1) {
      return '১ বছর আগে';
    } else if (months >= 2) {
      return `${toBengaliNumber(months)} মাস আগে`;
    } else if (months === 1) {
      return '১ মাস আগে';
    } else if (weeks >= 2) {
      return `${toBengaliNumber(weeks)} সপ্তাহ আগে`;
    } else if (weeks === 1) {
      return '১ সপ্তাহ আগে';
    } else if (days >= 2) {
      return `${toBengaliNumber(days)} দিন আগে`;
    } else if (days === 1) {
      return 'গতকাল';
    } else if (hours >= 2) {
      return `${toBengaliNumber(hours)} ঘন্টা আগে`;
    } else if (hours === 1) {
      return '১ ঘন্টা আগে';
    } else if (minutes >= 2) {
      return `${toBengaliNumber(minutes)} মিনিট আগে`;
    } else if (minutes === 1) {
      return '১ মিনিট আগে';
    } else if (seconds >= 30) {
      return 'কিছুক্ষণ আগে';
    } else {
      return 'এইমাত্র';
    }
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'কিছুক্ষণ আগে';
  }
};

export const formatBengaliDate = (dateString: string | Date | number): string => {
  if (!dateString) return '';
  
  try {
    // Handle different input types
    let date: Date;
    if (dateString instanceof Date) {
      date = dateString;
    } else if (typeof dateString === 'number') {
      date = new Date(dateString);
    } else if (typeof dateString === 'string') {
      date = new Date(dateString);
      
      // If the date string doesn't have timezone info, treat it as UTC
      if (dateString.includes('T') && !dateString.includes('Z') && !dateString.includes('+')) {
        date = new Date(dateString + 'Z');
      }
    } else {
      return '';
    }
    
    if (isNaN(date.getTime())) return '';
    
    const bengaliMonths = [
      'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
      'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
    ];
    
    const day = date.getDate();
    const month = bengaliMonths[date.getMonth()];
    const year = date.getFullYear();
    
    return `${toBengaliNumber(day)} ${month}, ${toBengaliNumber(year)}`;
  } catch (error) {
    console.error('Error formatting Bengali date:', error);
    return '';
  }
};

export const toBengaliNumber = (num: number): string => {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num.toString().replace(/\d/g, (digit) => bengaliDigits[parseInt(digit)]);
};

// Current server time functions (removing any Express dependencies)
export const getCurrentServerTime = (): Date => {
  return new Date();
};

export const formatServerTimestamp = (timestamp: string | Date | number): string => {
  return getRelativeTimeInBengali(timestamp);
};

// UTC-aware timestamp creation for new records
export const createUTCTimestamp = (): string => {
  return new Date().toISOString();
};

// Normalize timestamps from Supabase to handle timezone issues
export const normalizeSupabaseTimestamp = (timestamp: string): Date => {
  if (!timestamp) return new Date();
  
  try {
    // Supabase typically returns timestamps in UTC format
    let normalizedDate: Date;
    
    if (timestamp.includes('T')) {
      // ISO format - ensure it's treated as UTC if no timezone specified
      if (!timestamp.includes('Z') && !timestamp.includes('+') && !timestamp.includes('-', 10)) {
        normalizedDate = new Date(timestamp + 'Z');
      } else {
        normalizedDate = new Date(timestamp);
      }
    } else {
      // Fallback for other formats
      normalizedDate = new Date(timestamp);
    }
    
    return isNaN(normalizedDate.getTime()) ? new Date() : normalizedDate;
  } catch (error) {
    console.error('Error normalizing timestamp:', error);
    return new Date();
  }
};

// Debug function to help identify timestamp issues
export const debugTimestamp = (timestamp: string | Date | number, label: string = 'Timestamp'): void => {
  console.group(`🕒 ${label} Debug`);
  console.log('Original:', timestamp);
  console.log('Type:', typeof timestamp);
  console.log('Parsed Date:', new Date(timestamp as any));
  console.log('Is Valid:', !isNaN(new Date(timestamp as any).getTime()));
  console.log('Relative Time:', getRelativeTimeInBengali(timestamp));
  console.log('Bengali Date:', formatBengaliDate(timestamp));
  console.groupEnd();
};