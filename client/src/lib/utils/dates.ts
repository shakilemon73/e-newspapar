/**
 * Utility functions for date formatting in Bengali
 */

const bengaliNumerals = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export const toBengaliNumber = (num: number): string => {
  // Handle invalid numbers
  if (isNaN(num) || !isFinite(num)) {
    return '০';
  }
  
  return Math.floor(num).toString().split('').map(digit => {
    const numericDigit = parseInt(digit);
    return isNaN(numericDigit) ? digit : bengaliNumerals[numericDigit];
  }).join('');
};

export const bengaliMonths = [
  'জানুয়ারি',
  'ফেব্রুয়ারি',
  'মার্চ',
  'এপ্রিল',
  'মে',
  'জুন',
  'জুলাই',
  'আগস্ট',
  'সেপ্টেম্বর',
  'অক্টোবর',
  'নভেম্বর',
  'ডিসেম্বর'
];

export const bengaliDays = [
  'রবিবার',
  'সোমবার',
  'মঙ্গলবার',
  'বুধবার',
  'বৃহস্পতিবার',
  'শুক্রবার',
  'শনিবার'
];

export const formatBengaliDate = (date: Date | string | number): string => {
  try {
    const dateObj = new Date(date);
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return 'অজানা তারিখ';
    }
    
    const day = dateObj.getDate();
    const month = dateObj.getMonth();
    const year = dateObj.getFullYear();
    
    return `${toBengaliNumber(day)} ${bengaliMonths[month]} ${toBengaliNumber(year)}`;
  } catch (error) {
    console.error('Error formatting Bengali date:', error);
    return 'অজানা তারিখ';
  }
};

export const formatBengaliDateTime = (date: Date | string | number): string => {
  try {
    const dateObj = new Date(date);
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return 'অজানা সময়';
    }
    
    const day = dateObj.getDate();
    const month = dateObj.getMonth();
    const year = dateObj.getFullYear();
    const hours = dateObj.getHours();
    const minutes = dateObj.getMinutes();
    
    const formattedTime = `${toBengaliNumber(hours)}:${toBengaliNumber(minutes)}`;
    
    return `${toBengaliNumber(day)} ${bengaliMonths[month]} ${toBengaliNumber(year)}, ${formattedTime}`;
  } catch (error) {
    console.error('Error formatting Bengali date time:', error);
    return 'অজানা সময়';
  }
};

export const getBengaliWeekday = (date: Date | string | number): string => {
  try {
    const dateObj = new Date(date);
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return 'অজানা দিন';
    }
    
    const dayIndex = dateObj.getDay();
    return bengaliDays[dayIndex];
  } catch (error) {
    console.error('Error getting Bengali weekday:', error);
    return 'অজানা দিন';
  }
};

export const getRelativeTimeInBengali = (date: Date | string | number): string => {
  try {
    const now = new Date();
    const dateObj = new Date(date);
    
    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      console.warn('Invalid date received:', date);
      return 'অজানা সময়';
    }
    
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
    
    // Handle future dates
    if (diffInSeconds < 0) {
      return 'ভবিষ্যতে';
    }
    
    if (diffInSeconds < 60) {
      return `${toBengaliNumber(diffInSeconds)} সেকেন্ড আগে`;
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${toBengaliNumber(diffInMinutes)} মিনিট আগে`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${toBengaliNumber(diffInHours)} ঘন্টা আগে`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `${toBengaliNumber(diffInDays)} দিন আগে`;
    }
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `${toBengaliNumber(diffInMonths)} মাস আগে`;
    }
    
    const diffInYears = Math.floor(diffInMonths / 12);
    return `${toBengaliNumber(diffInYears)} বছর আগে`;
  } catch (error) {
    console.error('Error in getRelativeTimeInBengali:', error, 'Date:', date);
    return 'অজানা সময়';
  }
};
