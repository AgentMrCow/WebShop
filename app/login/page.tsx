// @/app/login/page.tsx
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import LoginComponent from '@/app/(component)/login';

export default async function LoginPage() {
  const session = await getServerSession();
  if (session) {
    redirect('/');
  }
  return <LoginComponent />;
}
