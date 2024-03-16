// @/app/category/[category]/[slug]/page.tsx
"use client"
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Image from 'next/image';
import Breadcrumbs from '@/app/(component)/breadcrumbs';
import AddToCartButton from '@/app/(component)/AddToCartButton';
import QuantitySelector from '@/app/(component)/QuantitySelector';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@/app/globals.css';

type Params = {
  params: {
    category: string;
    slug: string;
  };
};

const ProductPage: React.FC<Params> = ({ params }) => {
  const { category, slug } = params;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await axios.get<Product>(`/api/${slug}`);
        setProduct(response.data);
      } catch (error) {
        console.error('Failed to fetch product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!product) {
    return <div className="container mt-5"><p>Product not found.</p></div>;
  }

  const capitalizeFirstLetter = (string: string) => string.charAt(0).toUpperCase() + string.slice(1);
  const capitalizedCategory = category ? capitalizeFirstLetter(category.replace(/-/g, ' ')) : '';

  const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: capitalizedCategory, path: `/category/${category}` },
    { label: product.name },
  ];

  return (
    <>
      <Breadcrumbs breadcrumbs={breadcrumbs} />
      <div className="row">
        <div className="col-md-6">
          <Image src={product.image} className="card-img-top" alt={product.name} width={1024} height={1024} priority />
        </div>
        <div className="col-md-6">
          <h2>{product.name}</h2>
          <p className="lead">{product.description}</p>
          <p className="h4">${product.price}</p>
          {product.inventory <= 3 ? (
            <p className="text-danger">Only {product.inventory} left!</p>
          ) : (
            <p>In stock: {product.inventory}</p>
          )}
          <QuantitySelector quantity={quantity} onQuantityChange={setQuantity} />
          <AddToCartButton product={product} quantity={quantity} />
        </div>
      </div>
    </>
  );
};

export default ProductPage;