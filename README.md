# SkyRaven Ministries - Enterprise Web Application

[![CI/CD](https://github.com/skyravengreenfield-pixel/SkyRaven-Ministries/workflows/CI%2FCD%20Pipeline/badge.svg)](https://github.com/skyravengreenfield-pixel/SkyRaven-Ministries/actions)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-blue)](https://reactjs.org/)

An enterprise-grade web application for SkyRaven Ministries that enables secure donation management, transparent expense tracking, and project oversight.

## ✨ Features

### 🎯 Core Functionality
- **Donation Management**: Secure online donations with Stripe integration
- **Project Tracking**: Monitor ministry projects and goals
- **Expense Transparency**: Detailed expense tracking and verification
- **Document Management**: Secure document storage with Firebase
- **User Authentication**: Firebase-powered auth with email and Google sign-in
- **Real-time Database**: Cloud-based data storage with Firestore
- **Admin Dashboard**: Comprehensive administrative controls

### 🏗️ Enterprise Features
- **Payment Processing**: Stripe integration for secure donations
- **Cloud Infrastructure**: Firebase for auth, database, and storage
- **Authentication & Authorization**: Role-based access control with Firebase
- **Error Tracking**: Sentry integration for real-time monitoring
- **Analytics**: User behavior and conversion tracking
- **Performance Monitoring**: Real-time performance metrics
- **API Layer**: Robust HTTP client with retry logic
- **Testing**: Comprehensive unit and E2E testing
- **CI/CD**: Automated deployment pipeline
- **Security**: CSP headers, input sanitization, rate limiting

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18.2 with TypeScript
- **Build Tool**: Vite 5.0
- **State Management**: Redux Toolkit + React Query
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Routing**: React Router DOM

### Development Tools
- **Testing**: Vitest + Playwright + Testing Library
- **Linting**: ESLint + TypeScript ESLint
- **Formatting**: Prettier
- **Git Hooks**: Husky + Lint-Staged
- **Bundler**: Vite with compression

### Monitoring & Analytics
- **Error Tracking**: Sentry
- **Analytics**: Google Analytics (configurable)
- **Logging**: Custom logger with multiple levels

### Integrations
- **Firebase**: Authentication, Firestore, Storage
- **Stripe**: Payment processing and subscriptions

## 🔥 Firebase & Stripe Integration

This application includes full Firebase and Stripe integration for:
- **Firebase Auth**: Email/password and Google sign-in
- **Firestore**: Real-time cloud database
- **Firebase Storage**: Secure file storage
- **Stripe Payments**: One-time and recurring donations

### Quick Setup

1. **Get Firebase credentials** from [Firebase Console](https://console.firebase.google.com/)
2. **Get Stripe key** from [Stripe Dashboard](https://dashboard.stripe.com/)
3. Add to `.env.local`:

```env
# Firebase
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_PROJECT_ID=your_project_id
# ... (see .env.example for all variables)

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
```

**📚 Full Documentation:**
- [Firebase & Stripe Integration Guide](FIREBASE_STRIPE_INTEGRATION.md)
- [Quick Start Guide](QUICKSTART_FIREBASE_STRIPE.md)
- [Setup Complete Summary](FIREBASE_STRIPE_COMPLETE.md)

## � Quick Start

### Installation

1. Clone the repository:
```bash
git clone https://github.com/skyravengreenfield-pixel/SkyRaven-Ministries.git
cd SkyRaven-Ministries
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 📝 Scripts

```bash
# Development
npm run dev                # Start dev server
npm run build              # Build for production
npm run preview            # Preview production build

# Testing
npm run test               # Run unit tests
npm run test:ui            # Run tests with UI
npm run test:coverage      # Run tests with coverage
npm run test:e2e           # Run E2E tests

# Code Quality
npm run lint               # Lint code
npm run lint:fix           # Fix linting issues
npm run format             # Format code
npm run format:check       # Check formatting
npm run type-check         # TypeScript type checking
npm run validate           # Run all checks

# Analysis
npm run analyze            # Analyze bundle size
```

## 📁 Project Structure

```
SkyRaven-Ministries/
├── .github/
│   └── workflows/         # CI/CD pipelines
├── docs/                  # Documentation
│   ├── PERFORMANCE.md
│   ├── SECURITY.md
│   └── TESTING.md
├── public/                # Static assets
├── src/
│   ├── components/        # React components
│   │   ├── ui/           # Reusable UI components
│   │   ├── ErrorBoundary.tsx
│   │   └── Loading.tsx
│   ├── config/           # Configuration files
│   │   ├── constants.ts
│   │   ├── environment.ts
│   │   └── validation.ts
│   ├── contexts/         # React contexts
│   │   └── AuthContext.tsx
│   ├── hooks/            # Custom React hooks
│   ├── screens/          # Page components
│   ├── services/         # API services
│   │   ├── apiClient.ts
│   │   ├── analytics.ts
│   │   ├── authService.ts
│   │   └── monitoring.ts
│   ├── store/            # Redux store
│   │   ├── index.ts
│   │   └── slices/
│   ├── tests/            # Test utilities
│   ├── types/            # TypeScript types
│   ├── utils/            # Utility functions
│   │   ├── errorHandler.ts
│   │   ├── helpers.ts
│   │   ├── logger.ts
│   │   ├── security.ts
│   │   └── validation.ts
│   ├── index.css
│   └── main.tsx
├── .editorconfig
├── .eslintrc.json
├── .gitignore
├── .prettierrc.json
├── package.json
├── tsconfig.json
├── vite.config.ts
└── vitest.config.ts
```

## ⚙️ Configuration

### Environment Variables

See [`.env.example`](.env.example) for all available options:

```env
# API Configuration
VITE_API_BASE_URL=https://api.skyraven-ministries.org
VITE_API_TIMEOUT=30000

# Features
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_TRACKING=true

# Monitoring
VITE_SENTRY_DSN=your-sentry-dsn
```

### TypeScript

TypeScript configuration is in [`tsconfig.json`](tsconfig.json). Path aliases are configured:
```typescript
import { Button } from '@/components/ui';
```

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

Tests are written with Vitest and Testing Library:
```typescript
import { describe, it, expect } from 'vitest';
import { renderWithProviders, screen } from './tests/utils';

describe('Component', () => {
  it('renders correctly', () => {
    renderWithProviders(<Component />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### E2E Tests
```bash
npm run test:e2e
```

See [docs/TESTING.md](docs/TESTING.md) for more details.

## 🔒 Security

- **Authentication**: JWT-based authentication
- **CSP**: Content Security Policy headers
- **Input Validation**: Zod schema validation
- **Rate Limiting**: Client-side rate limiting
- **Security Headers**: X-Frame-Options, X-Content-Type-Options, etc.

See [docs/SECURITY.md](docs/SECURITY.md) for security best practices.

## 📊 Monitoring

### Error Tracking
Sentry is configured for error tracking:
```typescript
import { monitoringService } from '@/services/monitoring';

monitoringService.captureException(error, { context: 'data' });
```

### Analytics
Track user events:
```typescript
import { analyticsService } from '@/services/analytics';

analyticsService.trackDonation(amount, projectName);
```

## 🚢 Deployment

### Manual Deployment
```bash
npm run build
# Deploy dist/ folder to your hosting provider
```

### CI/CD
GitHub Actions workflow automatically:
1. Runs tests and linting
2. Builds the application
3. Deploys to staging (develop branch)
4. Deploys to production (main branch)

## 🎨 UI Components

Enterprise-grade UI components are available in `src/components/ui/`:

```typescript
import { Button, Card, Input, Modal, Toast } from '@/components/ui';

<Button variant="primary" size="lg" isLoading={loading}>
  Donate Now
</Button>

<Input 
  label="Email" 
  error={errors.email} 
  leftIcon={<Mail />} 
/>

<Card padding="lg" hover>
  <CardTitle>Project Title</CardTitle>
  <CardContent>Content here</CardContent>
</Card>
```

## 🔧 Development Tools

### VS Code Extensions
Recommended extensions (see [`.vscode/extensions.json`](.vscode/extensions.json)):
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- Playwright
- Vitest

### Git Hooks
Husky is configured with:
- **pre-commit**: Lint and format staged files
- **pre-push**: Run full validation (tests, lint, type-check)

## 📈 Performance

- **Code Splitting**: Automatic chunk splitting
- **Compression**: Gzip and Brotli compression
- **Tree Shaking**: Removes unused code
- **Lazy Loading**: Components loaded on demand
- **Caching**: Smart API response caching

See [docs/PERFORMANCE.md](docs/PERFORMANCE.md) for optimization details.

## 📚 Documentation

- [Enterprise Upgrade Guide](ENTERPRISE_UPGRADE.md) - Overview of all improvements
- [Performance Guide](docs/PERFORMANCE.md) - Performance optimization
- [Security Guide](docs/SECURITY.md) - Security best practices
- [Testing Guide](docs/TESTING.md) - Testing strategies

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Support

For support, email support@skyraven-ministries.org or open an issue on GitHub.

## 🎯 Roadmap

- [ ] Payment gateway integration (Stripe)
- [ ] Real-time notifications
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Offline mode
- [ ] PWA support
- [ ] Email campaigns
- [ ] Volunteer management
- [ ] Event calendar

---

**Built with ❤️ for SkyRaven Ministries**

## Support

For questions or support, please contact SkyRaven Ministries.

---

Built with ❤️ for SkyRaven Ministries