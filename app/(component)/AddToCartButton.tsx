"use client";
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/app/(component)/CartContext';

interface AnimationItem {
  id: string;
  quantity: number;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({ product, quantity }) => {
  const { addItem, items, hydrated } = useCart();
  const [animations, setAnimations] = useState<AnimationItem[]>([]);

  const handleAddToCart = () => {
    if (!Number.isSafeInteger(quantity) || quantity < 1 || product.inventory < 1) return;
    const available = Math.min(99, product.inventory) - (items.find(item => item.id === product.id)?.quantity ?? 0);
    const added = Math.min(quantity, available);
    if (added < 1) return;
    addItem(product, added);
    setAnimations((prev) => [...prev, { id: crypto.randomUUID(), quantity: added }]);
  };

  return (
    <div className="relative">
      <Button type="button" className="ml-auto" disabled={!hydrated || product.inventory < 1 || (items.find(item => item.id === product.id)?.quantity ?? 0) >= Math.min(99, product.inventory)} onClick={handleAddToCart}>{product.inventory < 1 ? 'Out of stock' : 'Add to Cart'}</Button>
      {animations.map((animation) => (
        <div
          key={animation.id}
          className="webshop-cart-added absolute right-0 bottom-0 text-lg font-bold pointer-events-none"
          onAnimationEnd={() => {
            // Remove the animation from the list when it completes
            setAnimations((prev) => prev.filter((item) => item.id !== animation.id));
          }}
        >
          +{animation.quantity}
        </div>
      ))}
    </div>
  );
};

export default AddToCartButton;
