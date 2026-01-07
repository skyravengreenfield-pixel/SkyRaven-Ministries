# Security Best Practices

## Authentication
- JWT tokens stored in localStorage (consider httpOnly cookies for production)
- Automatic token refresh on expiration
- Secure session management

## API Security
- All requests include Authorization header
- CSRF protection via custom headers
- Rate limiting on client side

## Content Security Policy
Configured CSP headers prevent:
- XSS attacks
- Clickjacking
- Data injection

## Input Validation
- Client-side validation with Zod
- Input sanitization before display
- Length limits on all inputs

## Security Headers
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin

## Best Practices
1. Never store sensitive data in localStorage unencrypted
2. Validate all user input
3. Use HTTPS in production
4. Implement proper CORS policies
5. Keep dependencies updated
6. Regular security audits
7. Follow OWASP guidelines

## Reporting Security Issues
Please report security vulnerabilities responsibly to the security team.
