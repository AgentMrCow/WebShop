// @/app/(component)/AddToCartButton.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/app/(component)/CartContext';
import { motion } from 'framer-motion';

interface AnimationItem {
  id: number;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({ product, quantity }) => {
  const { addItem } = useCart();
  const [animations, setAnimations] = useState<AnimationItem[]>([]);

  const handleAddToCart = () => {
    addItem(product, quantity);
    setAnimations((prev) => [...prev, { id: Date.now() }]); // Use the current timestamp as a unique ID
  };

  return (
    <div className="relative">
      <Button className="ml-auto" onClick={handleAddToCart}>Add to Cart</Button>
      {animations.map((animation) => (
        <motion.div
          key={animation.id} // Key each animation by its unique ID
          className="absolute right-0 bottom-0 text-lg font-bold"
          initial={{ opacity: 0, scale: 0.5, y: 0 }}
          animate={{ opacity: 1, scale: 1.5, y: -50 }}
          exit={{ opacity: 0 }} // Define exit animation
          transition={{ duration: 1, type: 'spring', stiffness: 300 }}
          onAnimationComplete={() => {
            // Remove the animation from the list when it completes
            setAnimations((prev) => prev.filter((item) => item.id !== animation.id));
          }}
        >
          +{quantity}
        </motion.div>
      ))}
    </div>
  );
};

export default AddToCartButton;
