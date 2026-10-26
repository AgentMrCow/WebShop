"use client";

import PasswordForm from '@/app/(component)/PasswordForm';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useSession } from 'next-auth/react';

export default function Settings() {
  const { data: session } = useSession();
  const provider = session?.user?.provider;
  return <Card className="max-w-xl"><CardHeader><CardTitle>Account settings</CardTitle><CardDescription>Manage your WebShop sign-in.</CardDescription></CardHeader><CardContent>{provider === 'google' || provider === 'github' ? <p className="text-sm text-gray-600">You signed in with {provider}. Manage that account&apos;s password with your sign-in provider.</p> : <PasswordForm />}</CardContent></Card>;
}
