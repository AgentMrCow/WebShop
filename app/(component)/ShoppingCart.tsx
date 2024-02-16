// @/app/(component)/ShoppingCart.tsx
"use client"
import React, { createContext, useContext, useState, useRef, ReactNode } from 'react';
import Link from 'next/link';
import { Popover, Button, OverlayTrigger, Form } from 'react-bootstrap';
import { Product, products } from '@/app/(data)/data';
import { categories } from '@/app/(data)/data';

interface ShoppingCartContextType {
    cartItems: Product[];
    addToCart: (product: Product) => void;
    removeFromCart: (id: number) => void;
    clearCart: () => void;
    calculateTotal: () => string;
}

const ShoppingCartContext = createContext<ShoppingCartContextType>({
    cartItems: [],
    addToCart: () => { },
    removeFromCart: () => { },
    clearCart: () => { },
    calculateTotal: () => '',
});

export const useShoppingCart = () => useContext(ShoppingCartContext);

interface ShoppingCartProviderProps {
    children: ReactNode;
}

interface Category {
    name: string;
}


export const ShoppingCartProvider: React.FC<ShoppingCartProviderProps> = ({ children }) => {
    const [cartItems, setCartItems] = useState<Product[]>([]);

    const addToCart = (product: Product) => {
        setCartItems((prevItems) => {
            const existingItem = prevItems.find((item) => item.id === product.id);
            if (existingItem) {
                return prevItems.map((item) =>
                    item.id === product.id ? { ...item, inventory: item.inventory + 1 } : item
                );
            }
            return [...prevItems, { ...product, inventory: 1 }];
        });
    };

    const removeFromCart = (id: number) => {
        setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => total + item.price * item.inventory, 0).toFixed(2);
    };

    return (
        <ShoppingCartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, calculateTotal }}>
            {children}
        </ShoppingCartContext.Provider>
    );
};

export const ShoppingCart: React.FC = () => {
    const { cartItems, removeFromCart, calculateTotal } = useShoppingCart();
    const [showPopover, setShowPopover] = useState(false);
    const hideTimeoutId = useRef<number | null>(null);

    const handleMouseEnter = () => {
        if (hideTimeoutId.current !== null) {
            clearTimeout(hideTimeoutId.current);
        }
        setShowPopover(true);
    };

    const handleMouseLeave = () => {
        hideTimeoutId.current = window.setTimeout(() => {
            setShowPopover(false);
        }, 100);
    };

    const popover = (
        <Popover id="popover-basic" className="shopping-cart-popover">
            <Popover.Header as="h3">Shopping Cart</Popover.Header>
            <Popover.Body onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                {cartItems.length === 0 ? (
                    <p>Your cart is empty</p>
                ) : (
                    cartItems.map((item) => (
                        <div key={item.id} className="d-flex justify-content-between align-items-center mb-2">
                            <img src={item.thumbnail} alt={item.name} className="w-25 h-auto" />
                            <div className="mx-2">{item.name}</div>
                            <Form.Control
                                type="number"
                                value={item.inventory}
                                readOnly // Since the context handles state, this input could be made read-only or removed
                                className="w-25"
                            />
                            <div>${(item.price * item.inventory).toFixed(2)}</div>
                            <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => removeFromCart(item.id)}>
                                X
                            </button>
                        </div>
                    ))
                )}
                <div className="d-flex justify-content-between align-items-center mt-3">
                    <strong>Total:</strong>
                    <span>${calculateTotal()}</span>
                </div>
                {/* Checkout button functionality needs implementation */}
                <button type="button" className="btn btn-primary mt-2">
                    Checkout
                </button>
            </Popover.Body>
        </Popover>
    );

    return (
        <OverlayTrigger
            trigger="click"
            placement="bottom"
            overlay={popover}
            show={showPopover}
            onToggle={(isVisible) => setShowPopover(isVisible)}
            delay={{ show: 0, hide: 100 }}
        >
            <button className=" btn btn-success d-flex align-items-center" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                Cart <span>&nbsp;</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-cart3" viewBox="0 0 16 16">
                    <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .49.598l-1 5a.5.5 0 0 1-.465.401l-9.397.472L4.415 11H13a.5.5 0 0 1 0 1H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5M3.102 4l.84 4.479 9.144-.459L13.89 4zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4m7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4m-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2m7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2" />
                </svg>
            </button>
        </OverlayTrigger>
    );
};

const CategoryItem = ({ category }: { category: Category }) => {
    const [showPopover, setShowPopover] = useState(false);
    const clearHideTimeout = useRef<number | undefined>(undefined);

    const handleMouseEnter = () => {
        if (clearHideTimeout.current !== undefined) {
            clearTimeout(clearHideTimeout.current);
        }
        setShowPopover(true);
    };

    const handleMouseLeave = () => {
        clearHideTimeout.current = window.setTimeout(() => {
            setShowPopover(false);
        }, 50);
    };

    return (
        <OverlayTrigger
            trigger="click"
            placement="bottom"
            overlay={
                <Popover id={`popover-positioned-bottom-${category.name}`}>
                    <Popover.Header as="h3">{category.name}</Popover.Header>
                    <Popover.Body
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                    >
                        {products.filter(product => product.category === category.name).map((product, prodIndex) => (
                            <Link key={prodIndex} href={`/category/${category.name.toLowerCase()}/${product.slug}`} passHref className="dropdown-item">{product.name}</Link>
                        ))}
                    </Popover.Body>
                </Popover>
            }
            show={showPopover}
            onToggle={(isVisible) => setShowPopover(isVisible)}
        >
            <li
                className="nav-item dropdown"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <Link href={`/category/${category.name.toLowerCase()}`} passHref className="nav-link dropdown-toggle" id={`navbarDropdown-${category.name}`}> {category.name}</Link>
            </li>
        </OverlayTrigger>
    );
};

const ShoppingCartComponentWithProvider: React.FC = () => {
    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <div className="container-fluid">
                <Link href="/" passHref className="navbar-brand">{"IERG4210 Niu Ka Ngai's WebShop"}</Link>
                <div className="navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav">
                        {categories.map((category, index) => (
                            <CategoryItem key={index} category={category} />
                        ))}
                    </ul>
                </div>
                <ShoppingCartProvider>
                    <ShoppingCart />
                </ShoppingCartProvider>
            </div>
        </nav>
    );
};

export default ShoppingCartComponentWithProvider;
