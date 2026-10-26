"use client"
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Image from 'next/image';
import Breadcrumbs from '@/app/(component)/breadcrumbs';
import AddToCartButton from '@/app/(component)/AddToCartButton';
import QuantitySelector from '@/app/(component)/QuantitySelector';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const ProductPage = () => {
  const { category, slug } = useParams<{ category: string; slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError('');
      setProduct(null);
      setQuantity(1);
      try {
        const response = await axios.get<Product>(`/api/${encodeURIComponent(slug)}`);
        setProduct(response.data);
      } catch (cause) {
        if (!axios.isAxiosError(cause) || cause.response?.status !== 404) setError('This product is temporarily unavailable.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug, retry]);

  if (loading) {
    return <p role="status" className="py-8">Loading product…</p>;
  }
  if (error) return <div role="alert" className="space-y-3 py-8"><p>{error}</p><Button variant="outline" onClick={() => setRetry(value => value + 1)}>Retry</Button></div>;

  if (!product) {
    return <div className="space-y-3 py-8"><p>Product not found.</p><Link href="/" className="text-blue-600 underline">Browse all categories</Link></div>;
  }

  const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: product.Category.name, path: `/category/${category}` },
    { label: product.name },
  ];

  return (
    <>
      <Breadcrumbs breadcrumbs={breadcrumbs} />
      <div className="flex flex-wrap mx-auto">
        <div className="w-full md:w-1/2 pr-4">
          <Image src={product.image} alt={product.name} width={1024} height={1024} priority />
        </div>
        <div className="w-full md:w-1/2 pl-4">
          <h2 className="text-2xl font-bold">{product.name}</h2>
          <p className="mt-2">{product.description}</p>
          <p className="text-xl font-semibold my-2">${product.price.toFixed(2)}</p>
          {product.inventory <= 3 ? (
            <p className="text-red-500">{product.inventory === 0 ? 'Out of stock' : `Only ${product.inventory} left!`}</p>
          ) : (
            <p className="text-green-500">In stock: {product.inventory}</p>
          )}
          <div className="mt-4">
            <QuantitySelector quantity={quantity} max={product.inventory} disabled={product.inventory < 1} onQuantityChange={setQuantity} />
            <p className="p-2"></p>
            <AddToCartButton product={product} quantity={quantity} />
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductPage;
