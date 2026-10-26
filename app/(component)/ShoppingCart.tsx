"use client";

import { useCart } from './CartContext';
import { CardTitle, CardHeader, CardContent, Card, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import QuantitySelector from './QuantitySelector';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Trash2 } from 'lucide-react';

export default function ShoppingCartPage({ disabled = false }: { disabled?: boolean }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { items, hydrated, updateItemQuantity, removeItem } = useCart();
  const total = items.reduce((sum, item) => sum + Math.round(item.price * 100) * item.quantity, 0) / 100;
  const unavailable = items.some(item => item.inventory !== undefined && item.quantity > item.inventory);
  if (!hydrated) return <p className="p-6 text-center" role="status">Loading your cart…</p>;
  if (items.length === 0) return <div className="space-y-4 p-6 text-center">
    <h2 className="text-xl font-semibold">Your cart is empty</h2>
    <p className="text-sm text-gray-500">Find something you like in the WebShop collection.</p>
    <Button asChild><Link href="/">Continue shopping</Link></Button>
  </div>;
  return <div className="w-full space-y-3 p-4">
    <h2 className="mb-4 text-xl font-semibold">{session?.user?.name ? `${session.user.name}, review your cart` : 'Review your cart'}</h2>
    {items.map(item => <Card key={item.id}>
      <CardHeader className="pb-3"><CardTitle className="text-base">{item.name}</CardTitle><p className="text-sm text-gray-500">USD ${item.price.toFixed(2)} each</p></CardHeader>
      <CardContent className="flex flex-wrap items-center justify-between gap-3">
        <Image src={item.image} alt={item.name} className="h-14 w-14 rounded-md object-cover" height={56} width={56} />
        <QuantitySelector quantity={item.quantity} max={item.inventory ?? 99} disabled={disabled || item.inventory === 0} onQuantityChange={quantity => updateItemQuantity(item.id, quantity)} />
        <Button type="button" size="icon" variant="outline" disabled={disabled} aria-label={`Remove ${item.name}`} onClick={() => removeItem(item.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
        {item.inventory !== undefined && item.quantity > item.inventory && <p className="w-full text-sm text-red-700" role="alert">{item.inventory === 0 ? 'This item is no longer available. Please remove it.' : `Only ${item.inventory} available. Please reduce the quantity.`}</p>}
      </CardContent>
    </Card>)}
    <Card><CardHeader><CardTitle>Subtotal</CardTitle></CardHeader><CardContent className="space-y-3">
      {items.map(item => <div key={item.id} className="flex justify-between gap-4 text-sm"><span>{item.name} × {item.quantity}</span><span className="shrink-0">${(item.price * item.quantity).toFixed(2)}</span></div>)}
      <Separator /><div className="flex justify-between font-semibold"><span>Total (USD)</span><span>${total.toFixed(2)}</span></div>
      <p className="text-xs text-gray-500">Final prices and availability are checked when you place the order.</p>
    </CardContent>{pathname !== '/checkout' && <CardFooter><Button className="w-full" size="lg" disabled={unavailable || disabled} asChild={!unavailable && !disabled}>
      {unavailable || disabled ? 'Review unavailable items' : <Link href="/checkout">Proceed to Checkout</Link>}
    </Button></CardFooter>}</Card>
  </div>;
}
