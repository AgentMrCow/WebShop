// @/app/(component)/QuantitySelector.tsx
"use client"
import React, { useState, useEffect } from 'react';

const QuantitySelector: React.FC<QuantitySelectorProps> = ({ quantity, onQuantityChange }) => {
    const [localQuantity, setLocalQuantity] = useState(quantity);

    useEffect(() => {
        setLocalQuantity(quantity);
    }, [quantity]);

    const handleIncrement = () => {
        const newQuantity = localQuantity + 1;
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
        setLocalQuantity(newQuantity);
        onQuantityChange(newQuantity);
    };

    return (
        <div className="d-flex align-items-center">
            <button className="btn btn-outline-secondary btn-sm" onClick={handleDecrement}>-</button>
            <input
                type="number"
                className="form-control mx-2"
                value={localQuantity}
                onChange={handleQuantityChange}
                min="1"
                style={{ width: '60px', textAlign: 'center' }}
            />
            <button className="btn btn-outline-secondary btn-sm" onClick={handleIncrement}>+</button>
        </div>
    );
};

export default QuantitySelector;
