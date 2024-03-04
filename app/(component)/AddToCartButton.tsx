// @/app/(component)/AddToCartButton.tsx
import React from 'react';
import { useCart } from '@/app/(component)/CartContext';

const AddToCartButton: React.FC<AddToCartButtonProps> = ({ product, quantity }) => {
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem(product, quantity);
  };

  return (
    <button className="btn btn-primary" onClick={handleAddToCart}>Add to Cart</button>
  );
};

export default AddToCartButton;