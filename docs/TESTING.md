# Testing Guide

## Unit Testing

### Running Tests
```bash
# Run all tests
npm test

# Run with UI
npm run test:ui

# Run with coverage
npm run test:coverage
```

### Writing Tests
```typescript
import { describe, it, expect } from 'vitest';
import { renderWithProviders, screen } from './tests/utils';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    renderWithProviders(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

## E2E Testing

### Setup Playwright
```bash
npx playwright install
```

### Run E2E Tests
```bash
npm run test:e2e
```

## Test Coverage

Current coverage thresholds:
- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

## Best Practices

1. Write tests for critical functionality
2. Test user interactions, not implementation
3. Use meaningful test descriptions
4. Mock external dependencies
5. Keep tests independent
6. Use data-testid for stable selectors
7. Test edge cases and error states

## Mock Data

Use the mock utilities in `src/tests/utils.tsx`:
```typescript
import { mockUser, mockProject } from './tests/utils';

const user = mockUser({ name: 'Test User' });
```
