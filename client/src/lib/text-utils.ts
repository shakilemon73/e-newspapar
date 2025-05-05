/**
 * Utility functions for text manipulation and summarization
 */

/**
 * Creates a summary of a longer text by extracting key sentences
 * 
 * This algorithm:
 * 1. Splits text into sentences
 * 2. Assigns scores to sentences based on position and keyword frequency
 * 3. Returns top-scoring sentences as a summary
 * 
 * @param text The full text to summarize
 * @param maxLength Maximum length of summary in characters (default: 300)
 * @returns A summarized version of the text
 */
export function summarizeText(text: string, maxLength: number = 300): string {
  if (!text || text.length <= maxLength) return text;
  
  // Split text into sentences (handles both Bengali and Latin punctuation)
  const sentences = text.split(/(?<=[।.!?])\s+/);
  if (sentences.length <= 3) return text;
  
  // Score sentences based on position and content
  const scoredSentences = sentences.map((sentence, index) => {
    // Position score - first and last sentences are important
    let score = 0;
    
    // First 2 sentences get high scores
    if (index === 0) score += 3;
    if (index === 1) score += 2;
    
    // Last sentence often contains conclusions
    if (index === sentences.length - 1) score += 2;
    
    // Length score - not too short, not too long
    const wordCount = sentence.split(/\s+/).length;
    if (wordCount > 5 && wordCount < 25) score += 1;
    
    // Keyword score - sentences with significant words
    const significantWords = [
      'অর্থনীতি', 'রাজনীতি', 'ক্রিকেট', 'সরকার', 'বাংলাদেশ', 
      'সিদ্ধান্ত', 'গুরুত্বপূর্ণ', 'উন্নয়ন', 'সফল', 'বিশেষ', 'সর্বাধিক',
      'অভিযোগ', 'মূল', 'বিশ্ব', 'দেশ', 'জনগণ', 'মন্ত্রী', 'সংসদ', 'আইন'
    ];
    
    for (const word of significantWords) {
      if (sentence.includes(word)) score += 1;
    }
    
    return { sentence, score, index };
  });
  
  // Sort sentences by score, then by original position
  scoredSentences.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.index - b.index; // maintain original order for same scores
  });
  
  // Select top sentences until we reach desired length
  let summary = '';
  let currentLength = 0;
  
  // First reorder by original position
  const topSentences = scoredSentences
    .slice(0, Math.max(3, Math.ceil(sentences.length / 5)))
    .sort((a, b) => a.index - b.index);
  
  for (const { sentence } of topSentences) {
    if (currentLength + sentence.length <= maxLength) {
      summary += sentence + ' ';
      currentLength += sentence.length + 1;
    } else {
      break;
    }
  }
  
  return summary.trim();
}

/**
 * Calculates the estimated reading time for a piece of text
 * 
 * @param text The text to calculate reading time for
 * @param wordsPerMinute Average reading speed in words per minute (default: 200)
 * @returns Reading time in minutes
 */
export function calculateReadingTime(text: string, wordsPerMinute: number = 200): number {
  const wordCount = text.split(/\s+/).length;
  const readingTimeMinutes = Math.ceil(wordCount / wordsPerMinute);
  return readingTimeMinutes;
}

/**
 * Extracts the first few sentences as a preview of an article
 * 
 * @param text Full article text
 * @param maxLength Maximum length of the excerpt
 * @returns A short excerpt from the beginning of the text
 */
export function generateExcerpt(text: string, maxLength: number = 160): string {
  if (!text || text.length <= maxLength) return text;
  
  // Split by sentence endings
  const sentences = text.split(/(?<=[।.!?])\s+/);
  
  let excerpt = '';
  for (const sentence of sentences) {
    if (excerpt.length + sentence.length <= maxLength) {
      excerpt += sentence + ' ';
    } else {
      break;
    }
  }
  
  excerpt = excerpt.trim();
  
  // If still too long, truncate and add ellipsis
  if (excerpt.length > maxLength) {
    excerpt = excerpt.substring(0, maxLength - 3) + '...';
  }
  
  return excerpt;
}