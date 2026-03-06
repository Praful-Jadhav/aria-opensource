import { redirect } from 'next/navigation';
import { validateSession } from '@/services/auth';
import { cookies } from 'next/headers';
import db from '@/lib/db';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value || cookieStore.get('session')?.value;
  
  if (!token) {
    redirect('/login');
  }

  const userId = await validateSession(token);
  if (!userId) redirect('/login');

  const user = await db.user.findUnique({
    where: { id: userId }
  });

  if (!user) redirect('/login');

  return <DashboardClient userEmail={user.email} />;
}
