"use client";

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import axios from 'axios';
import { changePWSchema } from '@/app/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function PasswordForm() {
  const [values, setValues] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = changePWSchema.safeParse(values);
    if (!parsed.success) { setError(parsed.error.issues[0].message); return; }
    setPending(true); setError('');
    try {
      await axios.post('/api/auth/change-password', parsed.data);
      setValues({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSuccess(true);
      await signOut({ callbackUrl: '/login' });
    } catch (cause) {
      setError(axios.isAxiosError(cause) && typeof cause.response?.data?.error === 'string' ? cause.response.data.error : 'Unable to update your password. Please retry.');
    } finally { setPending(false); }
  }
  return <form onSubmit={submit} className="space-y-4">
    <p className="text-sm text-gray-500">Use 12–72 characters with uppercase, lowercase and a number. You will sign in again after changing your password.</p>
    {(['currentPassword', 'newPassword', 'confirmPassword'] as const).map((field, index) => <div className="space-y-2" key={field}>
      <Label htmlFor={`change-${field}`}>{['Current password', 'New password', 'Confirm new password'][index]}</Label>
      <Input id={`change-${field}`} type="password" required maxLength={72} autoComplete={index === 0 ? 'current-password' : 'new-password'} value={values[field]} onChange={event => setValues(current => ({ ...current, [field]: event.target.value }))} />
    </div>)}
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    {success && <p role="status" className="text-sm text-green-700">Password updated. Signing you out…</p>}
    <Button disabled={pending} type="submit">{pending ? 'Updating…' : 'Change password'}</Button>
  </form>;
}
