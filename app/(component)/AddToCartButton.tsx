// @/app/(component)/AddToCartButton.tsx
"use client"
import React from 'react';
import { useShoppingCart } from '@/app/(component)/ShoppingCart';
import { Product } from '@/app/(data)/data';

interface AddToCartButtonProps {
    product: Product;
    //quantity: number;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({ product }) => {
    const { addToCart } = useShoppingCart();

    const handleAddToCart = () => {
        addToCart(product);
    };

    return (
        <button className="btn btn-primary" onClick={handleAddToCart}>
            Add to Cart
        </button>
    );
};

export default AddToCartButton;
