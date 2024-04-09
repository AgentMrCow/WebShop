// @/app/(component)/QuantitySelector.tsx
"use client"
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const QuantitySelector: React.FC<QuantitySelectorProps> = ({ quantity, onQuantityChange }) => {
    const [localQuantity, setLocalQuantity] = useState(quantity);

    useEffect(() => {
        setLocalQuantity(quantity);
    }, [quantity]);

    const handleIncrement = () => {
        const newQuantity = localQuantity < 99999 ? localQuantity + 1 : 99999;
        setLocalQuantity(newQuantity);
        onQuantityChange(newQuantity);
    };

    const handleDecrement = () => {
        const newQuantity = localQuantity > 1 ? localQuantity - 1 : 1;
        setLocalQuantity(newQuantity);
        onQuantityChange(newQuantity);
    };

    const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newQuantity = parseInt(e.target.value, 10) || 1;
        if (newQuantity <= 99999) {
            setLocalQuantity(newQuantity);
            onQuantityChange(newQuantity);
        } else {
            e.preventDefault();
        }
    };

    return (
        <div className="flex items-center">
            <Button onClick={handleDecrement} variant={"outline"} className="px-2 py-1 text-sm">-</Button>
            <Input
                type="number"
                className="mx-2 text-center w-16 text-sm py-1"
                value={localQuantity}
                onChange={handleQuantityChange}
                min="1"
                max="99999"
            />
            <Button onClick={handleIncrement} variant={"outline"} className="px-2 py-1 text-sm">+</Button>

        </div>
    );
};


export default QuantitySelector;
