// @/app/category/[category]/page.tsx
import React from 'react';
import Link from 'next/link';
import { products } from '@/app/(data)/data';
import AddToCartButton from '@/app/(component)/AddToCartButton';
import Breadcrumbs from '@/app/(component)/breadcrumbs';
import QuantitySelector from '@/app/@QuantitySelector/page';
import '@/app/globals.css';

type Params = {
    params: {
        category: string;
    };
};

const CategoryPage: React.FC<Params> = ({ params }) => {
    const { category } = params;

    // Function to capitalize the first letter of each word
    const capitalizeWords = (string: string) =>
        string
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

    const capitalizedCategory = capitalizeWords(category);

    const filteredProducts = products.filter(p => p.category.toLowerCase() === category.toLowerCase());

    const breadcrumbs = [
        { label: 'Home', path: '/' },
        { label: capitalizedCategory },
    ];

    return (
        <>
            <Breadcrumbs breadcrumbs={breadcrumbs} />
            <div className="row">
                <h2 className="mb-4">{capitalizedCategory}</h2>
                <div className="row">
                    {filteredProducts.map((product) => {

                        return (
                            <div key={product.id} className="col-md-4 mb-4">
                                <div className="card h-100">
                                    <Link href={`/category/${category}/${product.slug}`} passHref className="text-decoration-none">
                                        <img src={product.thumbnail} className="card-img-top" alt={product.name} />
                                    </Link>
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <Link href={`/category/${category}/${product.slug}`} passHref className="text-decoration-none">
                                                <h5 className="card-title">{product.name}</h5>
                                            </Link>
                                            <div className="d-flex align-items-center">
                                                <QuantitySelector />
                                            </div>
                                        </div>
                                        <div className="mt-3 d-flex justify-content-between align-items-center">
                                            <p className="card-text mb-0">${product.price}</p>
                                            <AddToCartButton product={product} />
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

