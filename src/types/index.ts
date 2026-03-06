// ─── API Response ───────────────────────────────────────────────────────────

export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
};

// ─── User ───────────────────────────────────────────────────────────────────

export type UserStatus = 'ACTIVE' | 'SUSPENDED';

// ─── Connection ─────────────────────────────────────────────────────────────

export type ConnectionStatus = 'active' | 'expired' | 'revoked';
export type ConnectionType = 'oauth' | 'api_key' | 'token';

// ─── Routing ────────────────────────────────────────────────────────────────

export type ActionType = 'api_call' | 'oauth_refresh' | 'connection_test';

// ─── OTP ────────────────────────────────────────────────────────────────────

export type OtpType = 'email' | 'phone';
