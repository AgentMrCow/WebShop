"use client";

import { useEffect, useState } from 'react';
import { signIn, signOut, getSession, useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { loginFormSchema } from '@/app/zod';
import OAuthButtons from './OAuthButtons';
import PasswordForm from './PasswordForm';

type Order = { uuid: string; status?: string; mode?: 'demo' | 'paypal-sandbox'; total?: number; currency?: string; orderDetails?: string; createdAt: string;
  items?: Array<{ name: string; quantity: number; price: number }> };
function detailsFor(order: Order) {
  try {
    const parsed = order.orderDetails ? JSON.parse(order.orderDetails) : {};
    return { items: order.items ?? (Array.isArray(parsed.items) ? parsed.items : []), total: order.total ?? Number(parsed.total ?? 0), currency: order.currency ?? parsed.currency ?? 'USD' };
  } catch { return { items: order.items ?? [], total: order.total ?? 0, currency: order.currency ?? 'USD' }; }
}

export default function LoginComponent() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [callbackUrl, setCallbackUrl] = useState('/');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersError, setOrdersError] = useState('');
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('account');

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const value = query.get('callbackUrl');
    if (query.get('tab') === 'orders') setActiveTab('orders');
    if (value) { try { const url = new URL(value, window.location.origin); if (url.origin === window.location.origin) setCallbackUrl(url.pathname + url.search); } catch { /* Keep the safe default. */ } }
  }, [pathname]);
  const loadOrders = async () => {
    setOrdersLoading(true); setOrdersError('');
    try { const response = await axios.get<Order[]>('/api/order'); setOrders(response.data); }
    catch { setOrdersError('Order history is temporarily unavailable.'); }
    finally { setOrdersLoading(false); }
  };
  useEffect(() => { if (session?.user) void loadOrders(); else setOrders([]); }, [session?.user?.id, session?.user?.email]);

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = loginFormSchema.safeParse({ email, password });
    if (!parsed.success) { setError(parsed.error.issues[0].message); return; }
    setPending(true); setError('');
    try {
      const response = await signIn('credentials', { ...parsed.data, redirect: false });
      if (!response || response.error) { setError('Unable to sign in. Check your email and password.'); return; }
      setPassword('');
      const verified = await getSession();
      router.push(callbackUrl === '/' && verified?.user?.isAdmin ? '/admin' : callbackUrl);
      router.refresh();
    } catch { setError('Sign-in is temporarily unavailable. Please retry.'); }
    finally { setPending(false); }
  }
  async function cancelOrder(uuid: string) {
    setCancelling(uuid); setOrdersError('');
    try { await axios.put('/api/checkout', { orderUUID: uuid }); await loadOrders(); }
    catch (cause) { setOrdersError(axios.isAxiosError(cause) && typeof cause.response?.data?.error === 'string' ? cause.response.data.error : 'Unable to cancel this order.'); }
    finally { setCancelling(null); }
  }

  if (status === 'loading') return <p className="p-6 text-center" role="status">Loading your account…</p>;
  if (session?.user) return <Card className="w-full">
    <CardHeader><CardTitle>My account</CardTitle><CardDescription className="break-all">{session.user.email}</CardDescription></CardHeader>
    <CardContent><Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="w-full"><TabsTrigger className="flex-1" value="account">Account</TabsTrigger><TabsTrigger className="flex-1" value="orders">My orders</TabsTrigger></TabsList>
      <TabsContent value="account" className="space-y-5 pt-4">
        <p>Hello, {session.user.name || 'WebShop member'}.</p>
        {session.user.isAdmin && <Button asChild className="w-full"><Link href="/admin">Open Admin Panel</Link></Button>}
        {session.user.provider === 'google' || session.user.provider === 'github' ? <p className="text-sm text-gray-500">You signed in with {session.user.provider}. Manage that account&apos;s password with your sign-in provider.</p> : <PasswordForm />}
      </TabsContent>
      <TabsContent value="orders" className="space-y-3 pt-4">
        {ordersLoading && <p role="status" className="text-sm">Loading orders…</p>}
        {ordersError && <div role="alert" className="space-y-2 text-sm text-red-700"><p>{ordersError}</p><Button variant="outline" onClick={loadOrders}>Retry</Button></div>}
        {!ordersLoading && !orders.length && !ordersError && <p className="py-4 text-sm text-gray-500">You have no orders yet.</p>}
        {orders.map(order => { const detail = detailsFor(order); const state = (order.status ?? 'pending').toLowerCase(); return <details className="rounded-md border p-3" key={order.uuid}>
          <summary className="cursor-pointer space-y-1 text-sm"><span className="font-semibold">{state === 'demo' ? 'Demo order · No charge' : state === 'completed' && order.mode === 'demo' ? 'Demo completed · No charge' : (state === 'paid' || state === 'completed') && order.mode === 'paypal-sandbox' ? 'Sandbox payment confirmed' : state.replaceAll('_', ' ').charAt(0).toUpperCase() + state.replaceAll('_', ' ').slice(1)}</span><span className="block text-gray-500">{new Date(order.createdAt).toLocaleString()} · {detail.currency} ${Number(detail.total).toFixed(2)}</span></summary>
          <p className="mt-3 break-all text-xs text-gray-500">{order.uuid}</p>
          <ul className="my-3 space-y-2 text-sm">{detail.items.map((item: { name: string; quantity: number; price: number }, index: number) => <li key={index} className="flex justify-between gap-3"><span>{item.name} × {item.quantity}</span><span className="shrink-0">${(item.price * item.quantity).toFixed(2)}</span></li>)}</ul>
          {(state === 'demo' || state === 'pending') && <Button size="sm" variant="outline" disabled={cancelling === order.uuid} onClick={() => cancelOrder(order.uuid)}>{cancelling === order.uuid ? 'Cancelling…' : 'Cancel order'}</Button>}
        </details>; })}
      </TabsContent>
    </Tabs></CardContent>
    <CardFooter className="justify-between"><Link href="/" className="text-sm text-blue-600">Continue shopping</Link><Button variant="outline" onClick={() => signOut({ callbackUrl: '/' })}>Logout</Button></CardFooter>
  </Card>;

  const form = <Card className="w-full"><CardHeader><CardTitle className="text-3xl">Welcome back</CardTitle><CardDescription>Sign in to WebShop to save and view your orders.</CardDescription></CardHeader>
    <CardContent><OAuthButtons callbackUrl={callbackUrl} /><form onSubmit={login} className="space-y-4">
      <div className="space-y-2"><Label htmlFor="login-email">Email</Label><Input id="login-email" type="email" autoComplete="username" required maxLength={254} placeholder="you@example.com" value={email} onChange={event => setEmail(event.target.value)} /></div>
      <div className="space-y-2"><Label htmlFor="login-password">Password</Label><Input id="login-password" type="password" autoComplete="current-password" required maxLength={72} value={password} onChange={event => setPassword(event.target.value)} /></div>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <Button disabled={pending} className="w-full" type="submit">{pending ? 'Signing in…' : 'Login'}</Button>
    </form></CardContent><CardFooter className="text-sm">New to WebShop? <Link href="/register" className="ml-1 font-semibold text-blue-600">Register</Link></CardFooter>
  </Card>;
  return pathname === '/login' ? <div className="my-6 flex flex-col sm:flex-row"><div className="relative hidden min-h-[520px] flex-1 sm:block"><Image alt="WebShop sign-in illustration" src="/login.webp" fill sizes="(min-width: 640px) 50vw, 100vw" className="object-cover" /></div><div className="w-full sm:max-w-md">{form}</div></div> : form;
}
