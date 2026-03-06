import type { ApiResponse } from '@/types';

// ─── Structured Error Logging ───────────────────────────────────────────────

interface ErrorContext {
  route: string;
  method: string;
  userId?: string;
  [key: string]: unknown;
}

export function logError(error: unknown, context: ErrorContext): void {
  const timestamp = new Date().toISOString();
  const message = error instanceof Error ? error.message : 'Unknown error';
  const stack = error instanceof Error ? error.stack : undefined;

  console.error(JSON.stringify({
    level: 'ERROR',
    timestamp,
    message,
    stack,
    ...context,
  }));
}

// ─── Safe API Error Response ────────────────────────────────────────────────
// Never exposes stack traces or internal details to the client.

export function safeErrorResponse(
  error: unknown,
  context: ErrorContext,
  statusCode: number = 500
): Response {
  logError(error, context);

  const body: ApiResponse = {
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Something went wrong. Please try again later.',
    },
  };

  return new Response(JSON.stringify(body), {
    status: statusCode,
    headers: { 'Content-Type': 'application/json' },
  });
}

// ─── Validation Error Response ──────────────────────────────────────────────
// Returns user-safe validation message.

export function validationErrorResponse(
  code: string,
  message: string,
  statusCode: number = 400
): Response {
  const body: ApiResponse = {
    success: false,
    error: { code, message },
  };

  return new Response(JSON.stringify(body), {
    status: statusCode,
    headers: { 'Content-Type': 'application/json' },
  });
}

// ─── Success Response ───────────────────────────────────────────────────────

export function successResponse<T>(data: T, statusCode: number = 200): Response {
  const body: ApiResponse<T> = {
    success: true,
    data,
  };

  return new Response(JSON.stringify(body), {
    status: statusCode,
    headers: { 'Content-Type': 'application/json' },
  });
}

// ─── Unauthorized Response ──────────────────────────────────────────────────

export function unauthorizedResponse(): Response {
  return validationErrorResponse('UNAUTHORIZED', 'Authentication required', 401);
}
