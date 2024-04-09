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
import { toast } from "@/components/ui/use-toast"

type Params = {
    params: {
        category: string;
    };
};

const CategoryPage: React.FC<Params> = ({ params }) => {
    const { category } = params;
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [quantities, setQuantities] = useState<{ [productId: number]: number }>({});

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const response = await axios.get<Product[]>('/api/products');
                const filteredProducts = response.data.filter(p => p.Category.name.toLowerCase() === category.toLowerCase());
                setProducts(filteredProducts);
            } catch (error) {
                toast({
                    title: "Failed to fetch products",
                    description: `${error}`,
                });
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [category]);

    const categoryName = products.length > 0 ? products[0].Category.name : category;

    const breadcrumbs = [
        { label: 'Home', path: '/' },
        { label: categoryName },
    ];

    if (loading) {
        return <div>Loading...</div>;
    }

    const handleQuantityChange = (productId: number, quantity: number) => {
        setQuantities((prevQuantities) => ({ ...prevQuantities, [productId]: quantity }));
    };

    return (
        <>
            <Breadcrumbs breadcrumbs={breadcrumbs} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <h2 className="mb-4 col-span-full">{categoryName}</h2>
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
                                    ${product.price}
                                </CardDescription>
                            </CardContent>
                            <CardFooter className="flex justify-between items-center">
                                <QuantitySelector quantity={quantity} onQuantityChange={(newQuantity) => handleQuantityChange(product.id, newQuantity)} />
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
