"use client";

import { useId } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function QuantitySelector({ quantity, onQuantityChange, max = 99, disabled = false }: QuantitySelectorProps) {
  const id = useId();
  const limit = Math.min(99, Math.max(1, max));
  const update = (value: number) => {
    if (Number.isSafeInteger(value) && value > 0) onQuantityChange(Math.min(value, limit));
  };
  return <div className="flex items-center">
    <Button type="button" aria-label="Decrease quantity" disabled={disabled || quantity <= 1} onClick={() => update(quantity - 1)} variant="outline" className="px-2 py-1 text-sm">−</Button>
    <label className="sr-only" htmlFor={id}>Quantity</label>
    <Input id={id} type="number" inputMode="numeric" className="mx-2 w-16 text-center text-sm" value={quantity}
      disabled={disabled} min={1} max={limit} step={1} onChange={event => update(Number(event.target.value))} />
    <Button type="button" aria-label="Increase quantity" disabled={disabled || quantity >= limit} onClick={() => update(quantity + 1)} variant="outline" className="px-2 py-1 text-sm">+</Button>
  </div>;
}
