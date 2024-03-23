// @/app/register/page.tsx

import { getServerSession } from 'next-auth';
import RegisterForm from './form';
import { redirect } from 'next/navigation';

export default async function RegisterPage() {
  const session = await getServerSession();
  if (session) {
    redirect('/');
  }
  return <RegisterForm />;
}