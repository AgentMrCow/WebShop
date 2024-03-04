// @/app/(component)/ShoppingCart.tsx
"use client"
import React from 'react';
import { useCart } from '@/app/(component)/CartContext';
import { CardTitle, CardDescription, CardHeader, CardContent, Card, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import Image from 'next/image';



export default function ShoppingCartPage() {
    const { items, updateItemQuantity, removeItem } = useCart();

    const calculateTotal = () => {
        return items.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
    };

    if (items.length === 0) {
        return (
            <div className="flex flex-col w-full px-4">
                <h1 className="text-2xl font-bold text-center my-4">Your cart is empty</h1>
                <div className="text-center my-4">Enjoy your shopping!</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full px-4">
            <h1 className="text-2xl font-bold text-center my-4">Review your cart</h1>
            {items.map((item, index) => (
                <Card key={index}>
                    <CardHeader>
                        <CardTitle>{item.name}</CardTitle>
                        <CardDescription>${item.price.toFixed(2)}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <Label className="text-base" htmlFor={`quantity-${item.id}`}>
                                <Image src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded-md" height={64} width={64} />
                            </Label>
                            <div className="d-flex align-items-center">
                                <button className="btn btn-outline-secondary btn-sm ml-2" onClick={() => updateItemQuantity(item.id, Math.max(1, item.quantity - 1))}>
                                    -
                                </button>
                                <Input
                                    type="number"
                                    id={`quantity-${item.id}`}
                                    className="form-input text-center mx-2"
                                    value={item.quantity}
                                    onChange={(e) => {
                                        const newQuantity = parseInt(e.target.value, 10);
                                        if (newQuantity <= 99999) {
                                            updateItemQuantity(item.id, newQuantity);
                                        } else {
                                            e.preventDefault();
                                        }
                                    }}
                                    min="1"
                                    max="99999"
                                />


                                <button
                                    className="btn btn-outline-secondary btn-sm mr-2"
                                    onClick={() => {
                                        if (item.quantity < 99999) {
                                            updateItemQuantity(item.id, item.quantity + 1);
                                        }
                                    }}
                                >
                                    +
                                </button>

                            </div>
                            <Button size="icon" variant="outline" className="border-none" onClick={() => removeItem(item.id)}>
                                <TrashIcon className="h-4 w-4 text-red-500" />
                                <span className="sr-only">Remove</span>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
            <Card>
                <CardHeader>
                    <CardTitle>Subtotal</CardTitle>
                </CardHeader>
                <CardContent>
                    {items.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                            <div>{`${item.name} x${item.quantity}`}</div>
                            <div>${(item.price * item.quantity).toFixed(2)}</div>
                        </div>
                    ))}
                    <Separator />
                    <div className="flex items-center justify-between font-medium">
                        <div>Total</div>
                        <div>${calculateTotal()}</div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button className="w-full" size="lg">
                        Proceed to Checkout
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}

function TrashIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        </svg>
    )
}