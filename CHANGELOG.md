# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [1.0.0] - 2026-03-05

### Added
- **Core Platform**: Next.js 15 App Router with TypeScript
- **Authentication**: Email OTP, Phone OTP, GitHub OAuth, Google OAuth
- **Tool Connections**: GitHub and Google Workspace OAuth integration
- **API Key Management**: Store, test, and manage API keys for external services
- **Secure Proxy**: Route API calls through encrypted proxy with retry logic
- **Vault System**: AES-256-GCM encrypted credential storage with seal/unseal operations
- **Activity Logging**: Full audit trail for all API calls and credential access
- **Admin Dashboard**: Platform stats and user management
- **CRM Leads**: User classification and engagement tracking
- **Session Management**: JWT access tokens (15min) + refresh tokens (7 days) with rotation
- **Rate Limiting**: In-memory rate limiting on auth endpoints
- **Security Headers**: X-Content-Type-Options, X-Frame-Options, XSS protection
- **Docker Support**: Dockerfile and docker-compose.yml for self-hosting
- **CI/CD**: GitHub Actions workflow for build and type checking
