// @/app/checkout/page.tsx
"use client"
import React, { useState } from 'react';
import axios from 'axios';
import ShoppingCartPage from '@/app/(component)/ShoppingCart';
import { useCart } from '@/app/(component)/CartContext';
import { PayPalButtons } from "@paypal/react-paypal-js";
import { toast } from '@/components/ui/use-toast';
import { OnApproveData, OnApproveActions, CreateOrderData, CreateOrderActions } from '@paypal/paypal-js';

export default function Checkout() {

    const { items, clearCart } = useCart();
    const [transactionStatus, setTransactionStatus] = useState('IDLE');

    let currentOrderUUID: string | null = null;

    const cancelOrder = async () => {
        if (currentOrderUUID) {
            try {
                await axios.put('/api/checkout', {
                    orderUUID: currentOrderUUID,
                });
                toast({
                    title: `Order ${currentOrderUUID} cancelled successfully.`,
                })
                setTransactionStatus('CANCELLED');
            } catch (cancelError) {
                toast({
                    title: `Failed to cancel order ${currentOrderUUID}:`,
                    description: `${cancelError}`,
                })
                setTransactionStatus('ERROR');
            }
        }
    };

    const handleCreateOrder = async (data: CreateOrderData, actions: CreateOrderActions) => {
        try {
            const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2);
            const orderDetails = items.map(item => ({
                name: item.name,
                unit_amount: {
                    currency_code: "USD",
                    value: item.price.toFixed(2),
                },
                quantity: item.quantity.toString(),
            }));

            const res = await axios.post('/api/checkout', {
                items: orderDetails,
                total: total,
            });

            const orderData = res.data;
            currentOrderUUID = orderData.uuid;
            toast({
                title: "Order ID:",
                description: `${orderData.id}`,
            })
            return orderData.id;
        } catch (error) {
            toast({
                title: "Create order error:",
                description: `${error}`,
            })
            await cancelOrder();
            setTransactionStatus('ERROR');
        }
    };


    const handleApprove = async (data: OnApproveData, actions: OnApproveActions) => {
        try {
            const captureDetails = await actions.order?.capture();
            toast({
                title: "Payment captured successfully:",
                description: `${captureDetails}`,
            })

            const orderDetails = JSON.stringify({
                items: items.map(item => ({
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                })),
                total: items.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2),
                currency: "USD",
            });

            if (!currentOrderUUID) {
                throw new Error('No current order UUID set.');
            }

            await axios.patch('/api/checkout', {
                orderUUID: currentOrderUUID,
                orderDetails,
            });

            clearCart();
            currentOrderUUID = null;
            setTransactionStatus('APPROVED');
        } catch (error) {
            toast({
                title: "Approve order error:",
                description: `${error}`,
            })
            await cancelOrder();
            setTransactionStatus('ERROR');
        }
    };



    const handleCancel = async (data: Record<string, unknown>) => {
        toast({
            title: "Order cancelled:",
            description: `${data}`,
        })
        await cancelOrder();
        setTransactionStatus('CANCELLED');

    };

    const handleError = async (error: any) => {
        toast({
            title: "Payment error:",
            description: `${error}`,
        })
        await cancelOrder();
        setTransactionStatus('ERROR');

    };
    const renderFallbackContent = () => {
        switch (transactionStatus) {
            case 'APPROVED':
                return <img src='/trans_approve.webp' />;
            case 'CANCELLED':
                return <img src='/trans_cancel.webp' />;
            case 'ERROR':
                return <img src='/trans_error.webp' />;
            default:
                return (
                    <div>
                        {items.length === 0 && (
                            <img src='/shop2.webp' alt="Shop" />
                        )}

                        {items.length > 0 && (
                            <div className="flex flex-row justify-between items-start">
                                <div className="flex-1 min-h-[600px]">
                                    <PayPalButtons
                                        style={{ layout: "vertical", color: "blue" }}
                                        createOrder={handleCreateOrder}
                                        onApprove={handleApprove}
                                        onCancel={handleCancel}
                                        onError={handleError}
                                    />
                                </div>
                                <div className="flex-1 min-h-[600px]">
                                    <ShoppingCartPage />
                                </div>
                            </div>
                        )}
                    </div>
                );
        }
    };
    return (
        <div>
            {renderFallbackContent()}
        </div>
    );


}
