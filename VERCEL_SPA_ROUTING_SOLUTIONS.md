# Vercel SPA Routing Solutions - Research Documentation

## Problem Analysis
- **Error**: "invalid route source pattern" in vercel.json
- **Root Cause**: Incorrect regex syntax for path-to-regexp (not standard RegExp)
- **Current Routes**: 64 total (29 public + 35 admin pages)

## Official Vercel Solutions

### Solution 1: Simple Catch-All Pattern (Recommended)
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Solution 2: Exclude Static Files Pattern
```json
{
  "rewrites": [
    {
      "source": "/[^.]+",
      "destination": "/index.html"
    }
  ]
}
```

### Solution 3: Legacy Routes Pattern
```json
{
  "routes": [
    {
      "src": "/[^.]+",
      "dest": "/",
      "status": 200
    }
  ]
}
```

### Solution 4: With API Exclusion (Correct Syntax)
```json
{
  "rewrites": [
    {
      "source": "/((?!api).*)",
      "destination": "/index.html"
    }
  ]
}
```

## Path-to-Regexp vs RegExp Differences

**WRONG** (RegExp syntax):
- `(?!api/.*)` - Raw negative lookahead
- `/(?!api/.*).*` - Invalid for path-to-regexp

**CORRECT** (path-to-regexp syntax):
- `((?!api).*)` - Wrapped negative lookahead
- `/[^.]+` - Excludes files with extensions

## Implementation Strategy
1. Use simplest pattern first: `/(.*)`
2. If that fails, try: `/[^.]+`
3. Test with all 64 routes
4. Verify admin authentication works client-side

## Testing Checklist
- [ ] Public routes work (29 pages)
- [ ] Admin routes work (35 pages)
- [ ] Page refresh doesn't cause 404
- [ ] Direct URL access works
- [ ] Static assets load correctly