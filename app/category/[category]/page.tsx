// @/app/category/[category]/page.tsx
"use client"
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import axios from 'axios';
import AddToCartButton from '@/app/(component)/AddToCartButton';
import Breadcrumbs from '@/app/(component)/breadcrumbs';
import QuantitySelector from '@/app/(component)/QuantitySelector';
import '@/app/globals.css';

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
                console.error('Failed to fetch products:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [category]);


    const capitalizeWords = (string: string) =>
        string
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

    const capitalizedCategory = capitalizeWords(category);

    const breadcrumbs = [
        { label: 'Home', path: '/' },
        { label: capitalizedCategory },
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
            <div className="row">
                <h2 className="mb-4">{capitalizedCategory}</h2>
                <div className="row">
                    {products.map((product) => {
                        const quantity = quantities[product.id] || 1;

                        return (
                            <div key={product.id} className="col-md-4 mb-4">
                                <div className="card h-100">
                                    <Link href={`/category/${category}/${product.slug}`} passHref>
                                        <Image src={product.image} className="card-img-top" alt={product.name} width={1024} height={1024} />
                                    </Link>
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <Link href={`/category/${category}/${product.slug}`} passHref>
                                                <h5 className="card-title">{product.name}</h5>
                                            </Link>
                                            <div className="d-flex align-items-center">
                                                <QuantitySelector
                                                    quantity={quantity}
                                                    onQuantityChange={(newQuantity) => handleQuantityChange(product.id, newQuantity)}
                                                />
                                            </div>
                                        </div>
                                        <div className="mt-3 d-flex justify-content-between align-items-center">
                                            <p className="card-text mb-0">${product.price}</p>
                                            <AddToCartButton product={product} quantity={quantity} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
};

export default CategoryPage;
