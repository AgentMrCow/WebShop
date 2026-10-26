// @/app/category/[category]/page.tsx
"use client"
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import axios from 'axios';
import AddToCartButton from '@/app/(component)/AddToCartButton';
import Breadcrumbs from '@/app/(component)/breadcrumbs';
import QuantitySelector from '@/app/(component)/QuantitySelector';
import { Card, CardContent, CardHeader, CardFooter, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useParams } from 'next/navigation';

const CategoryPage = () => {
    const { category } = useParams<{ category: string }>();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [retry, setRetry] = useState(0);
    const [quantities, setQuantities] = useState<{ [productId: number]: number }>({});

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            setError(false);
            try {
                const response = await axios.get<Product[]>('/api/products');
                const filteredProducts = response.data.filter(p => p.Category.link.split('/').filter(Boolean).pop()?.toLowerCase() === category.toLowerCase());
                setProducts(filteredProducts);
            } catch {
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [category, retry]);

    const categoryName = products.length > 0 ? products[0].Category.name : category;

    const breadcrumbs = [
        { label: 'Home', path: '/' },
        { label: categoryName },
    ];

    if (loading) {
        return <p role="status" className="py-8">Loading products…</p>;
    }
    if (error) return <div role="alert" className="space-y-3 py-8"><p>Products are temporarily unavailable.</p><Button variant="outline" onClick={() => setRetry(value => value + 1)}>Retry</Button></div>;

    const handleQuantityChange = (productId: number, quantity: number) => {
        setQuantities((prevQuantities) => ({ ...prevQuantities, [productId]: quantity }));
    };

    return (
        <>
            <Breadcrumbs breadcrumbs={breadcrumbs} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <h2 className="mb-4 col-span-full">{categoryName}</h2>
                {!products.length && <p className="col-span-full py-8 text-gray-500">No products are available in this category. <Link href="/" className="text-blue-600 underline">Browse all categories</Link>.</p>}
                {products.map((product) => {
                    const quantity = quantities[product.id] || 1;
                    return (
                        <Card key={product.id} className="h-full">
                            <CardHeader className="p-0">
                                <Link href={`/category/${category}/${product.slug}`} passHref>
                                    <Image src={product.image} alt={product.name} width={1024} height={1024} />
                                </Link>
                            </CardHeader>
                            <CardContent className="pt-4 flex">
                                <CardTitle>
                                    <Link href={`/category/${category}/${product.slug}`} passHref>
                                        <h5 className="text-lg">{product.name}</h5>
                                    </Link>
                                </CardTitle>
                                <CardDescription className="ml-auto pt-1">
                                    ${product.price.toFixed(2)}
                                </CardDescription>
                            </CardContent>
                            <CardFooter className="flex flex-wrap gap-2 justify-between items-center">
                                <QuantitySelector quantity={quantity} max={product.inventory} disabled={product.inventory < 1} onQuantityChange={(newQuantity) => handleQuantityChange(product.id, newQuantity)} />
                                <div className="flex-shrink-0">
                                    <AddToCartButton product={product} quantity={quantity} />
                                </div>
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>
        </>
    );
};

export default CategoryPage;
