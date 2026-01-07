# Performance Optimization Guide

## Build Optimization

### Code Splitting
The application uses manual code splitting to optimize bundle size:
- **vendor.js**: React core libraries
- **ui.js**: UI icon library
- Additional chunks created automatically by Vite

### Compression
Both Gzip and Brotli compression are enabled for production builds.

### Minification
- Terser minification with console removal
- Source maps enabled for debugging

## Runtime Optimization

### Request Deduplication
The API client automatically deduplicates identical concurrent requests.

### Caching Strategy
- Short cache: 5 minutes for frequently changing data
- Medium cache: 15 minutes for semi-static data
- Long cache: 1 hour for static data

### Lazy Loading
Components and routes should be lazily loaded when possible:

```typescript
const Component = lazy(() => import('./Component'));
```

## Performance Monitoring

Use Sentry to track performance metrics:
- Page load times
- API request durations
- Component render times
- User interactions

## Best Practices

1. Use React.memo for expensive components
2. Implement virtualization for long lists
3. Optimize images (WebP, lazy loading)
4. Minimize bundle size
5. Use service workers for offline support
6. Implement skeleton screens for better UX
