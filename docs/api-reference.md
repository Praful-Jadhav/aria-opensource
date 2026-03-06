# ARIA Core — API Reference

## Authentication

### POST `/api/auth/email-otp/send`
Send OTP to email address.
```json
{ "email": "user@example.com" }
```

### POST `/api/auth/email-otp/verify`
Verify email OTP and create session.
```json
{ "email": "user@example.com", "otp": "123456" }
```

### POST `/api/auth/phone-otp/send`
Send OTP to phone number.

### POST `/api/auth/phone-otp/verify`
Verify phone OTP and create session.

### GET `/api/auth/github`
Redirect to GitHub OAuth flow.

### GET `/api/auth/github/callback`
GitHub OAuth callback handler.

### GET `/api/auth/google`
Redirect to Google OAuth flow.

### GET `/api/auth/google/callback`
Google OAuth callback handler.

### POST `/api/auth/refresh`
Refresh access token using refresh token cookie.

### POST `/api/auth/logout`
Invalidate session and clear cookies.

---

## Connections

### GET `/api/connections`
List all tool connections for the authenticated user.

### DELETE `/api/connections/[id]`
Remove a tool connection.

### GET `/api/connections/github/init`
Start GitHub OAuth tool connection flow.

### GET `/api/connections/github/callback`
Handle GitHub tool connection callback.

### POST `/api/connections/github/disconnect`
Disconnect GitHub tool.

### GET `/api/connections/google-workspace/init`
Start Google Workspace OAuth flow.

### GET `/api/connections/google-workspace/callback`
Handle Google Workspace callback.

### POST `/api/connections/google-workspace/disconnect`
Disconnect Google Workspace tool.

---

## API Keys

### GET `/api/keys`
List all API key connections.

### POST `/api/keys`
Add a new API key.
```json
{ "toolName": "openai", "apiKey": "sk-...", "baseUrl": "https://api.openai.com" }
```

### DELETE `/api/keys/[id]`
Remove an API key connection.

### POST `/api/keys/[id]/test`
Test an API key connection.

---

## Vault

### GET `/api/vault`
List all vault entries (metadata only, no ciphertext).

### DELETE `/api/vault/[id]`
Revoke a vault entry (soft-delete).

### POST `/api/vault/rotate`
Rotate encryption on all user's vault entries.

---

## Proxy

### POST `/api/proxy`
Route an API call through the proxy.
```json
{
  "toolName": "openai",
  "endpoint": "https://api.openai.com/v1/chat/completions",
  "method": "POST",
  "body": { ... },
  "headers": { ... }
}
```

---

## Dashboard

### GET `/api/dashboard/summary`
Get dashboard summary statistics.

---

## Health

### GET `/api/health`
System health check. Returns status of database, encryption, JWT, and routing.

---

## Settings

### GET/PUT `/api/settings/account`
Get or update account settings.

### GET `/api/settings/sessions`
List active sessions.

### DELETE `/api/settings/sessions/[id]`
Revoke a specific session.

---

## Admin (requires admin role)

### GET `/api/admin/stats`
Platform-wide statistics.

### GET `/api/admin/users`
List all users with pagination. Query params: `page`, `limit`.

---

## CRM (requires admin role)

### GET `/api/crm/leads`
List users classified as leads (new, active, power_user).
