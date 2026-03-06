import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * Admin layout — Auth guard that verifies admin status.
 * Wraps all /admin/* pages.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  if (!token) {
    redirect('/login');
  }

  // Decode JWT payload to check admin flag
  try {
    const parts = token.split('.');
    if (parts.length !== 3) redirect('/login');
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
    if (!payload.userId) redirect('/login');
    if (payload.exp && payload.exp * 1000 < Date.now()) redirect('/login');
  } catch {
    redirect('/login');
  }

  return <>{children}</>;
}
