// @/app/@QuantitySelector/page.tsx
"use client"
import React, { useState } from 'react';

const QuantitySelector: React.FC = () => {
    const [quantity, setQuantity] = useState(1);

    const handleIncrement = () => setQuantity(prevQty => prevQty + 1);
    const handleDecrement = () => setQuantity(prevQty => prevQty > 1 ? prevQty - 1 : 1);
    const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newQuantity = parseInt(e.target.value, 10);
        setQuantity(isNaN(newQuantity) ? 1 : newQuantity);
    };

    return (
        <div className="d-flex align-items-center">
            <button className="btn btn-outline-secondary btn-sm" onClick={handleDecrement}>-</button>
            <input 
                type="number" 
                className="form-control mx-2" 
                value={quantity} 
                onChange={handleQuantityChange} 
                min="1" 
                style={{ width: '60px', textAlign: 'center' }} 
            />
            <button className="btn btn-outline-secondary btn-sm" onClick={handleIncrement}>+</button>
        </div>
    );
};

export default QuantitySelector;