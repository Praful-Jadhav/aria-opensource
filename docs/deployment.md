# ARIA Core — Deployment Guide

## Quick Deploy Options

### Option 1: Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel dashboard
3. Set environment variables:
   ```
   JWT_SECRET=<64 hex chars>
   ENCRYPTION_KEY=<64 hex chars>
   DATABASE_URL=<PostgreSQL connection string>
   NEXT_PUBLIC_APP_URL=https://your-domain.com
   RESEND_API_KEY=<your Resend key>
   ```
4. Deploy

### Option 2: Docker Compose (Self-hosted)

```bash
# Clone the repo
git clone https://github.com/AriaPlatform/aria-core.git
cd aria-core

# Set environment variables
export JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
export ENCRYPTION_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

# Start services
docker-compose up -d
```

### Option 3: Render.com (Free tier)

1. Create a Render account
2. Create a PostgreSQL database (free tier: 1GB)
3. Create a Web Service, connect your GitHub repo
4. Set build command: `npm install && npx prisma migrate deploy && npm run build`
5. Set start command: `npm run start`
6. Add environment variables

## Production Checklist

- [ ] Use PostgreSQL (not SQLite)
- [ ] Set strong, unique JWT_SECRET (64 hex chars)
- [ ] Set strong, unique ENCRYPTION_KEY (64 hex chars)
- [ ] Enable HTTPS (required for secure cookies)
- [ ] Set up Resend for email OTP delivery
- [ ] Configure OAuth apps (GitHub, Google)
- [ ] Set ADMIN_EMAIL for the first admin user
- [ ] Run `npx prisma migrate deploy` on first deploy
- [ ] Verify `/api/health` returns all green

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | 64 hex char secret for JWT signing |
| `ENCRYPTION_KEY` | ✅ | 64 hex char key for AES-256-GCM |
| `NEXT_PUBLIC_APP_URL` | ✅ | Public URL of the app |
| `RESEND_API_KEY` | Optional | For email OTP delivery |
| `GITHUB_CLIENT_ID` | Optional | GitHub OAuth app client ID |
| `GITHUB_CLIENT_SECRET` | Optional | GitHub OAuth app secret |
| `GOOGLE_CLIENT_ID` | Optional | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Optional | Google OAuth client secret |
| `ADMIN_EMAIL` | Optional | Email for the default admin user |
