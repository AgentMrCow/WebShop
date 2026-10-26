"use client";

import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type Order = { uuid: string; username: string; status: string; mode?: 'demo' | 'paypal-sandbox'; total: number; totalCents?: number; createdAt: string };
type Customer = { id: string; email: string; isAdmin: boolean };

export default function Dashboard() {
  const [data, setData] = useState<{ products: Product[]; orders: Order[]; users: Customer[] } | null>(null);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    setError('');
    try {
      const [products, orders, users] = await Promise.all([
        axios.get<Product[]>('/api/products'), axios.put<Order[]>('/api/order'), axios.post<Customer[]>('/api/user'),
      ]);
      setData({ products: products.data, orders: orders.data, users: users.data });
    } catch { setError('Unable to load the dashboard. Please retry or sign in again.'); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  if (error) return <div role="alert" className="space-y-4"><p>{error}</p><Button onClick={load}>Retry</Button></div>;
  if (!data) return <p role="status">Loading dashboard…</p>;
  const paid = data.orders.filter(order => order.mode === 'paypal-sandbox' && ['paid', 'completed'].includes(order.status?.toLowerCase()));
  const testTotal = paid.reduce((total, order) => total + (order.totalCents !== undefined ? order.totalCents / 100 : Number(order.total) || 0), 0);
  const demoCount = data.orders.filter(order => order.mode === 'demo').length;
  const lowStock = data.products.filter(product => product.inventory <= 3).sort((a, b) => a.inventory - b.inventory);
  return <div className="space-y-6">
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {[['Products', data.products.length, '/admin/products'], ['Orders', data.orders.length, '/admin/orders'], ['Customers', data.users.length, '/admin/customers'], ['Sandbox payments', `$${testTotal.toFixed(2)}`, '/admin/orders']].map(([label, value, href]) => <Card key={label}>
        <CardHeader><CardDescription>{label}</CardDescription><CardTitle className="text-3xl">{value}</CardTitle></CardHeader>
        <CardContent><Link href={String(href)} className="text-sm text-blue-600">View details →</Link></CardContent>
      </Card>)}
    </div>
    <p className="rounded-md bg-blue-50 p-4 text-sm text-blue-900">{demoCount} demo orders saved. All payments shown here are sandbox test transactions; this is not real revenue.</p>
    <div className="grid gap-6 lg:grid-cols-2">
      <Card><CardHeader><CardTitle>Recent orders</CardTitle><CardDescription>Current records from WebShop.</CardDescription></CardHeader><CardContent className="space-y-4">
        {data.orders.length ? data.orders.slice(0, 5).map(order => <div key={order.uuid} className="flex justify-between gap-4 border-b pb-3 text-sm">
          <div className="min-w-0"><p className="truncate font-medium">{order.username}</p><p className="text-gray-500">{new Date(order.createdAt).toLocaleString()}</p></div>
          <span className="capitalize">{order.status}</span>
        </div>) : <p className="text-sm text-gray-500">No orders yet.</p>}
      </CardContent></Card>
      <Card><CardHeader><CardTitle>Inventory to review</CardTitle><CardDescription>Products with three or fewer units remaining.</CardDescription></CardHeader><CardContent className="space-y-4">
        {lowStock.length ? lowStock.slice(0, 8).map(product => <div className="flex justify-between gap-4 text-sm" key={product.id}><span>{product.name}</span><span className={product.inventory === 0 ? 'font-medium text-red-700' : 'text-amber-700'}>{product.inventory === 0 ? 'Out of stock' : `${product.inventory} left`}</span></div>) : <p className="text-sm text-gray-500">All products have healthy stock levels.</p>}
        <Link href="/admin/products" className="inline-block text-sm text-blue-600">Manage products →</Link>
      </CardContent></Card>
    </div>
  </div>;
}
