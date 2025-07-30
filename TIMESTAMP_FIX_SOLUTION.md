# Timestamp Fix Solution

## Problem
The "রোনালদো–বেকহামের জার্সি তৈরি কেন বন্ধ করল ম্যানচেস্টার ইউনাইটেড" article posted 30 minutes ago is showing "২১ ঘন্টা আগে" instead of "৩০ মিনিট আগে".

## Root Cause
The article's `published_at` timestamp in the database is set to 21 hours ago instead of 30 minutes ago. This is a database data issue, not a display formatting issue.

## Solution
Run this SQL command in your Supabase SQL editor to fix the timestamp:

```sql
UPDATE articles 
SET published_at = NOW() - INTERVAL '30 minutes',
    updated_at = NOW()
WHERE title ILIKE '%রোনালদো%';
```

## Alternative: Browser Console Fix
If you have admin access, open browser console on the admin page and run:

```javascript
// Fix the timestamp using the browser console
(async () => {
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
  console.log('Fixing timestamp to:', thirtyMinutesAgo.toISOString());
  
  // This would need the admin Supabase client available in the console
  // You can also use the TimestampFixer component I created
})();
```

## Prevention
To prevent this issue in the future:

1. When creating new articles, always use `new Date().toISOString()` for current time
2. Use the centralized date utilities I've created in `client/src/lib/utils/dates.ts`
3. The `createUTCTimestamp()` function ensures proper UTC timestamp creation

## Verification
After running the SQL command:
1. Refresh the homepage
2. The রোনালদো article should now show "৩০ মিনিট আগে" instead of "২১ ঘন্টা আগে"

## Technical Details
- Current system time: 2025-07-30T21:31:23Z
- Correct timestamp should be: 2025-07-30T21:01:23Z (30 minutes ago)
- Article was stored with timestamp: ~2025-07-30T00:31:23Z (21 hours ago)