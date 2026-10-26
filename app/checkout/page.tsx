"use client";

import { useRef, useState } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import ShoppingCartPage from '@/app/(component)/ShoppingCart';
import { useCart } from '@/app/(component)/CartContext';
import { useShopConfig } from '@/app/(component)/SessionContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

type OrderResponse = { mode: 'demo' | 'paypal-sandbox'; uuid: string; id?: string; order?: { uuid: string; total?: number; totalCents?: number } };
const messageFor = (error: unknown) => axios.isAxiosError(error) && typeof error.response?.data?.error === 'string'
  ? error.response.data.error : 'We could not complete this request. Please retry or check your order history.';

export default function Checkout() {
  const { data: session, status } = useSession();
  const { items, hydrated, completePurchase } = useCart();
  const { config, loading, error: configError, reload } = useShopConfig();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState<{ uuid: string; mode: string } | null>(null);
  const currentOrder = useRef<OrderResponse | null>(null);
  const submittedItems = useRef<Array<{ id: number; quantity: number }>>([]);
  const retryKey = useRef<{ fingerprint: string; key: string } | null>(null);
  const unavailable = items.some(item => item.inventory !== undefined && item.quantity > item.inventory);

  async function createOrder(): Promise<OrderResponse> {
    const snapshot = items.map(item => ({ id: item.id, quantity: item.quantity }));
    const fingerprint = JSON.stringify(snapshot);
    if (retryKey.current?.fingerprint !== fingerprint) retryKey.current = { fingerprint, key: crypto.randomUUID() };
    try {
      const response = await axios.post<OrderResponse>('/api/checkout', {
        items: snapshot.map(item => ({ productId: item.id, quantity: item.quantity })),
        idempotencyKey: retryKey.current.key,
      });
      currentOrder.current = response.data;
      submittedItems.current = snapshot;
      return response.data;
    } catch (cause) {
      // A previous tab or an expired reservation may have cancelled this attempt.
      // Preserve the key for uncertain transport failures, but start fresh after a confirmed cancellation.
      if (axios.isAxiosError(cause) && cause.response?.status === 409 &&
          cause.response.data?.error === 'This checkout was cancelled. Start a new checkout.') {
        currentOrder.current = null;
        retryKey.current = null;
      }
      throw cause;
    }
  }
  function finish(uuid: string, mode: string) {
    completePurchase(submittedItems.current);
    setReceipt({ uuid, mode });
    currentOrder.current = null;
    retryKey.current = null;
  }
  async function placeDemoOrder() {
    if (busy) return;
    setBusy(true); setError('');
    try {
      const order = await createOrder();
      if (order.mode !== 'demo') throw new Error('Checkout configuration changed. Refresh this page.');
      finish(order.uuid, 'demo');
    } catch (cause) { setError(messageFor(cause)); } finally { setBusy(false); }
  }
  async function cancelPendingOrder() {
    if (!currentOrder.current) return;
    await axios.put('/api/checkout', { orderUUID: currentOrder.current.uuid });
    currentOrder.current = null;
    retryKey.current = null;
  }

  if (!hydrated || status === 'loading' || loading) return <p className="py-12 text-center" role="status">Loading checkout…</p>;
  if (receipt) return <section className="mx-auto max-w-3xl space-y-5 py-8 text-center">
    <h1 className="text-3xl font-semibold">{receipt.mode === 'demo' ? 'Demo order saved' : 'Sandbox payment confirmed'}</h1>
    <p>{receipt.mode === 'demo' ? 'Your order has been saved to your account. No payment was collected.' : 'PayPal Sandbox confirmed the test payment. No real money was charged.'}</p>
    <p className="break-all text-sm text-gray-500">Order reference: {receipt.uuid}</p>
    <div className="flex flex-wrap justify-center gap-3"><Button asChild><Link href="/login?tab=orders">View my orders</Link></Button><Button asChild variant="outline"><Link href="/">Continue shopping</Link></Button></div>
    <Image src="/trans_approve.webp" alt="Order completed" width={1792} height={1024} className="rounded-lg" />
  </section>;
  if (!items.length) return <section className="py-6"><ShoppingCartPage /><Image src="/shop2.webp" alt="WebShop" width={1792} height={1024} className="mx-auto max-w-3xl rounded-lg" /></section>;

  return <section className="py-6">
    <h1 className="mb-6 text-3xl font-semibold">Checkout</h1>
    <div className="grid items-start gap-6 md:grid-cols-2">
      <Card><CardHeader><CardTitle>{config?.checkoutMode === 'paypal-sandbox' ? 'PayPal Sandbox' : 'Demo checkout'}</CardTitle><CardDescription>This is a course project. No real payment or shipment will take place.</CardDescription></CardHeader><CardContent className="space-y-5">
        {error && <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}
        {configError || !config ? <div><p className="mb-3">Checkout settings are temporarily unavailable.</p><Button onClick={reload}>Retry</Button></div>
          : !session ? <div className="space-y-4"><p>Sign in to save your order and view it later.</p><Button asChild><Link href="/login?callbackUrl=%2Fcheckout">Sign in to checkout</Link></Button><p className="text-sm">New to WebShop? <Link href="/register" className="text-blue-600 underline">Create an account</Link>.</p></div>
          : unavailable ? <p className="text-red-700" role="alert">Review the unavailable items in your cart before continuing.</p>
          : config.checkoutMode === 'demo' ? <><p>Place a test order using the current catalogue prices. You can find and cancel it in your account.</p><Button className="w-full" size="lg" disabled={busy} onClick={placeDemoOrder}>{busy ? 'Saving order…' : 'Place demo order — no charge'}</Button></>
          : config.paypalClientId ? <PayPalScriptProvider options={{ clientId: config.paypalClientId, currency: 'USD', intent: 'capture' }}>
            <PayPalButtons disabled={busy} style={{ layout: 'vertical', color: 'blue' }}
              createOrder={async () => { setBusy(true); setError(''); try { const order = await createOrder(); if (!order.id) throw new Error('Payment order unavailable'); return order.id; } catch (cause) { setError(messageFor(cause)); setBusy(false); throw cause; } }}
              onApprove={async data => {
                setBusy(true); setError('');
                try {
                  if (!currentOrder.current) throw new Error('Order session expired');
                  const uuid = currentOrder.current.uuid;
                  // Capture and payment verification happen on the server, never in browser-supplied order details.
                  await axios.patch('/api/checkout', { orderUUID: uuid, paypalOrderId: data.orderID });
                  finish(uuid, 'paypal-sandbox');
                } catch (cause) { setError(messageFor(cause)); } finally { setBusy(false); }
              }}
              onCancel={async () => { try { await cancelPendingOrder(); setError('The sandbox checkout was cancelled. Your cart has been kept.'); } catch (cause) { setError(messageFor(cause)); } finally { setBusy(false); } }}
              onError={() => { setBusy(false); setError('PayPal Sandbox could not finish. Check your order history before trying again.'); }} />
          </PayPalScriptProvider> : <p role="alert">Sandbox payments are temporarily unavailable. Please try again later.</p>}
      </CardContent></Card>
      <ShoppingCartPage disabled={busy} />
    </div>
  </section>;
}
