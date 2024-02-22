// @/app/(component)/AddToCartButton.tsx
"use client"
import React from 'react';
import { useShoppingCart } from '@/app/(component)/ShoppingCart';

interface Category {
    id: number;
    name: string;
    link: string;
    image: string;
    products?: Product[];
  }
  
  interface Product {
    id: number;
    name: string;
    slug: string;
    price: number;
    inventory: number;
    description: string;
    categoryId: number;
    image: string;
    Category: Category;
  }

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
