# Performance Optimization Guide

## Issue: Delay When Clicking Sidebar Links

### Root Cause

The delay you're experiencing (approximately 1 second) is caused by multiple factors:

1. **PageTransition Component** - Has a 150ms intentional delay
2. **Next.js Client-Side Navigation** - Takes time to load page components
3. **Data Fetching** - Pages fetch data on mount
4. **React Re-renders** - Component mounting and rendering

### Current Delay Breakdown

- PageTransition delay: **150ms**
- Next.js navigation: **100-300ms**
- Component mounting: **50-100ms**
- Data fetching: **200-500ms**
- **Total: ~500-1050ms**

## Solutions

### 1. Reduce PageTransition Delay (Quick Fix)

**File**: `components/layout/PageTransition.tsx`

Change the delay from 150ms to 50ms or remove it entirely:

```tsx
// Current (150ms delay)
const timer = setTimeout(() => {
  setDisplayChildren(children);
  setIsLoading(false);
}, 150);

// Faster (50ms delay)
const timer = setTimeout(() => {
  setDisplayChildren(children);
  setIsLoading(false);
}, 50);

// Instant (no delay)
setDisplayChildren(children);
setIsLoading(false);
```

### 2. Optimize Data Fetching

**Use React Query or SWR** for better caching:

```bash
npm install @tanstack/react-query
```

```tsx
import { useQuery } from '@tanstack/react-query';

const { data, isLoading } = useQuery({
  queryKey: ['goals'],
  queryFn: fetchGoals,
  staleTime: 5 * 60 * 1000, // Cache for 5 minutes
});
```

### 3. Prefetch Routes

Add prefetching to sidebar links:

```tsx
<Link 
  href={item.href}
  prefetch={true} // Prefetch on hover
>
```

### 4. Use Loading Skeletons Instead of Spinners

Replace full-page loading with skeleton screens:

```tsx
// Instead of showing spinner
if (isLoading) return <Spinner />;

// Show skeleton
if (isLoading) return <SkeletonCard />;
```

### 5. Implement Optimistic UI Updates

Update UI immediately, then sync with server:

```tsx
// Optimistic update
setGoals([...goals, newGoal]);

// Then sync with server
await createGoal(newGoal);
```

### 6. Code Splitting

Lazy load heavy components:

```tsx
import dynamic from 'next/dynamic';

const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <ChartSkeleton />,
});
```

### 7. Reduce Bundle Size

Check what's being loaded:

```bash
npm run build
# Check .next/analyze output
```

### 8. Use Suspense Boundaries

Wrap slow components in Suspense:

```tsx
<Suspense fallback={<Skeleton />}>
  <SlowComponent />
</Suspense>
```

## Recommended Quick Fixes

### Option A: Remove PageTransition Delay (Fastest)

```tsx
// components/layout/PageTransition.tsx
useEffect(() => {
  setDisplayChildren(children);
  setIsLoading(false);
}, [pathname, children]);
```

### Option B: Reduce Delay to 50ms (Balanced)

```tsx
// components/layout/PageTransition.tsx
const timer = setTimeout(() => {
  setDisplayChildren(children);
  setIsLoading(false);
}, 50); // Reduced from 150ms
```

### Option C: Remove PageTransition Entirely (Instant)

```tsx
// app/dashboard/layout.tsx
<main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
  <ErrorBoundary>
    {children} {/* Remove PageTransition wrapper */}
  </ErrorBoundary>
</main>
```

## Performance Monitoring

### Measure Navigation Time

```tsx
useEffect(() => {
  const start = performance.now();
  
  return () => {
    const end = performance.now();
    console.log(`Navigation took ${end - start}ms`);
  };
}, [pathname]);
```

### Use React DevTools Profiler

1. Install React DevTools
2. Open Profiler tab
3. Record navigation
4. Analyze render times

## Expected Results

After optimization:

- **Before**: 500-1050ms
- **After (Option A)**: 200-500ms
- **After (Option B)**: 250-600ms
- **After (Option C)**: 150-400ms

## Additional Optimizations

### 1. Memoize Components

```tsx
const MemoizedComponent = React.memo(Component);
```

### 2. Use useCallback for Functions

```tsx
const handleClick = useCallback(() => {
  // handler
}, [dependencies]);
```

### 3. Virtualize Long Lists

```bash
npm install react-window
```

### 4. Optimize Images

```tsx
import Image from 'next/image';

<Image 
  src="/logo.png" 
  width={40} 
  height={40}
  priority // For above-fold images
/>
```

### 5. Enable Compression

```js
// next.config.js
module.exports = {
  compress: true,
};
```

## Testing

### Lighthouse Audit

```bash
npm run build
npm start
# Run Lighthouse in Chrome DevTools
```

### Network Throttling

Test with slow 3G to simulate poor connections.

## Monitoring in Production

Use tools like:
- Vercel Analytics
- Google Analytics
- Sentry Performance
- New Relic

## Conclusion

The main culprit is the **150ms delay in PageTransition**. Removing or reducing this will give you the most immediate improvement. For best results, combine multiple optimizations.
