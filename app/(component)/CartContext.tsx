// @/app/(component)/CartContext.tsx
"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CartProviderProps {
    children: ReactNode;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
    const [items, setItems] = useState<CartItem[]>([]);

    useEffect(() => {
        const storedCart = localStorage.getItem('cart');
        if (storedCart) {
            setItems(JSON.parse(storedCart));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(items));
    }, [items]);

    const addItem = (product: Product, quantity: number) => {
        setItems((prevItems) => {
            const itemExists = prevItems.find((item) => item.id === product.id);
            if (itemExists) {
                const newQuantity = Math.min(itemExists.quantity + quantity, 99999);
                return prevItems.map((item) =>
                    item.id === product.id ? { ...item, quantity: newQuantity } : item
                );
            } else {
                const newItem = {
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    quantity: Math.min(quantity, 99999),
                    description: product.description,
                    image: product.image,
                    categoryId: product.categoryId,
                };
                return [...prevItems, newItem];
            }
        });
    };

    const updateItemQuantity = (id: number, quantity: number) => {
        const clampedQuantity = Math.min(quantity, 99999);

        setItems((prevItems) =>
            prevItems.map((item) => (item.id === id ? { ...item, quantity: clampedQuantity } : item))
        );
    };

    const removeItem = (id: number) => {
        setItems(prevItems => prevItems.filter(item => item.id !== id));
    };

    const clearCart = () => {
        setItems([]);
    };

    return (
        <CartContext.Provider value={{ items, addItem, updateItemQuantity, removeItem, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
