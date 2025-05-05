/**
 * Utility functions for date formatting in Bengali
 */

const bengaliNumerals = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export const toBengaliNumber = (num: number): string => {
  return num.toString().split('').map(digit => bengaliNumerals[parseInt(digit)] || digit).join('');
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
  const dateObj = new Date(date);
  const day = dateObj.getDate();
  const month = dateObj.getMonth();
  const year = dateObj.getFullYear();
  
  return `${toBengaliNumber(day)} ${bengaliMonths[month]} ${toBengaliNumber(year)}`;
};

export const formatBengaliDateTime = (date: Date | string | number): string => {
  const dateObj = new Date(date);
  const day = dateObj.getDate();
  const month = dateObj.getMonth();
  const year = dateObj.getFullYear();
  const hours = dateObj.getHours();
  const minutes = dateObj.getMinutes();
  
  const formattedTime = `${toBengaliNumber(hours)}:${toBengaliNumber(minutes < 10 ? '0' + minutes : minutes)}`;
  
  return `${toBengaliNumber(day)} ${bengaliMonths[month]} ${toBengaliNumber(year)}, ${formattedTime}`;
};

export const getBengaliWeekday = (date: Date | string | number): string => {
  const dateObj = new Date(date);
  const dayIndex = dateObj.getDay();
  
  return bengaliDays[dayIndex];
};

export const getRelativeTimeInBengali = (date: Date | string | number): string => {
  const now = new Date();
  const dateObj = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
  
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
};
