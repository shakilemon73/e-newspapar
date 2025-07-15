# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability within this Bengali News Website, please send an email to security@bengali-news.com. All security vulnerabilities will be promptly addressed.

### Please include the following information:

- Type of issue (e.g. buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the manifestation of the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit the issue

### Guidelines

- Please do not disclose the vulnerability publicly until it has been addressed by our team
- We will acknowledge your email within 48 hours
- We will provide regular updates about our progress
- If you have suggestions for fixing the vulnerability, please include them in your report

## Security Measures

This project implements several security measures:

- **Environment Variables**: Sensitive data stored in environment variables
- **Supabase Row Level Security**: Database access controlled by RLS policies
- **Input Validation**: All user inputs validated with Zod schemas
- **HTTPS**: Enforced in production environments
- **CORS**: Configured for specific domains in production
- **Authentication**: Secure user authentication via Supabase Auth

## Dependencies

We regularly update dependencies to ensure security patches are applied. You can check for known vulnerabilities by running:

```bash
npm audit
```

## Production Security Checklist

Before deploying to production, ensure:

- [ ] Environment variables are properly configured
- [ ] Supabase RLS policies are enabled
- [ ] HTTPS is enforced
- [ ] CORS is configured for your domain
- [ ] Database credentials are secure
- [ ] Regular security updates are scheduled
- [ ] Monitoring and logging are enabled