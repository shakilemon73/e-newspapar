// Bengali date formatting utilities
export const getRelativeTimeInBengali = (dateString: string): string => {
  if (!dateString) return 'কিছুক্ষণ আগে';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'কিছুক্ষণ আগে';
    
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(months / 12);

    if (years > 0) {
      return `${years} বছর আগে`;
    } else if (months > 0) {
      return `${months} মাস আগে`;
    } else if (days > 0) {
      return `${days} দিন আগে`;
    } else if (hours > 0) {
      return `${hours} ঘন্টা আগে`;
    } else if (minutes > 0) {
      return `${minutes} মিনিট আগে`;
    } else {
      return 'কিছুক্ষণ আগে';
    }
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'কিছুক্ষণ আগে';
  }
};

export const formatBengaliDate = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    
    const bengaliMonths = [
      'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
      'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
    ];
    
    const day = date.getDate();
    const month = bengaliMonths[date.getMonth()];
    const year = date.getFullYear();
    
    return `${day} ${month}, ${year}`;
  } catch (error) {
    console.error('Error formatting Bengali date:', error);
    return '';
  }
};

export const toBengaliNumber = (num: number): string => {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num.toString().replace(/\d/g, (digit) => bengaliDigits[parseInt(digit)]);
};