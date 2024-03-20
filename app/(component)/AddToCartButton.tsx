// @/app/(component)/AddToCartButton.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/app/(component)/CartContext';

const AddToCartButton: React.FC<AddToCartButtonProps> = ({ product, quantity }) => {
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem(product, quantity);
  };

  return (
    <Button className="ml-auto" onClick={handleAddToCart}>Add to Cart</Button>
  );
};

export default AddToCartButton;