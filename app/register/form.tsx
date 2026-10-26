"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { registerSchema } from '@/app/zod';
import OAuthButtons from '@/app/(component)/OAuthButtons';

export default function RegisterForm() {
  const router = useRouter();
  const [values, setValues] = useState({ email: '', newPassword: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  async function register(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = registerSchema.safeParse(values);
    if (!parsed.success) { setError(parsed.error.issues[0].message); return; }
    setPending(true); setError('');
    try {
      await axios.post('/api/auth/register', parsed.data);
      setValues({ email: '', newPassword: '', confirmPassword: '' });
      router.push('/login?registered=1');
    } catch (cause) {
      setError(axios.isAxiosError(cause) && typeof cause.response?.data?.error === 'string' ? cause.response.data.error : 'Registration is temporarily unavailable. Please retry.');
    } finally { setPending(false); }
  }
  return <div className="my-6 flex flex-col sm:flex-row">
    <div className="relative hidden min-h-[600px] flex-1 sm:block"><Image alt="WebShop registration illustration" src="/register.webp" fill sizes="(min-width: 640px) 50vw, 100vw" className="object-cover" /></div>
    <Card className="w-full sm:max-w-md"><CardHeader><CardTitle className="text-3xl">Guest Registration</CardTitle><CardDescription>Create an account to save your demo orders. This course project does not collect real payments or shipping details.</CardDescription></CardHeader>
      <CardContent><OAuthButtons /><form onSubmit={register} className="space-y-4">
        <div className="space-y-2"><Label htmlFor="register-email">Email</Label><Input id="register-email" type="email" autoComplete="username" placeholder="you@example.com" required maxLength={254} value={values.email} onChange={event => setValues(current => ({ ...current, email: event.target.value }))} /></div>
        <div className="space-y-2"><Label htmlFor="register-password">Password</Label><Input id="register-password" type="password" autoComplete="new-password" minLength={12} maxLength={72} required value={values.newPassword} onChange={event => setValues(current => ({ ...current, newPassword: event.target.value }))} /><p className="text-xs text-gray-500">12–72 characters, including uppercase, lowercase and a number.</p></div>
        <div className="space-y-2"><Label htmlFor="register-confirm">Confirm password</Label><Input id="register-confirm" type="password" autoComplete="new-password" required maxLength={72} value={values.confirmPassword} onChange={event => setValues(current => ({ ...current, confirmPassword: event.target.value }))} /></div>
        {error && <p className="text-sm text-red-700" role="alert">{error}</p>}
        <Button className="w-full" type="submit" disabled={pending}>{pending ? 'Creating account…' : 'Register'}</Button>
      </form></CardContent><CardFooter className="text-sm">Already have an account? <Link href="/login" className="ml-1 font-semibold text-blue-600">Login</Link></CardFooter>
    </Card>
  </div>;
}
