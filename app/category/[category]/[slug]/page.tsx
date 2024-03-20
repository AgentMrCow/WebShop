"use client"
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Image from 'next/image';
import Breadcrumbs from '@/app/(component)/breadcrumbs';
import AddToCartButton from '@/app/(component)/AddToCartButton';
import QuantitySelector from '@/app/(component)/QuantitySelector';
import { toast } from "@/components/ui/use-toast"

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
        toast({
          title: "Failed to fetch product",
          description: `${error}`,
        });
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
    return <div className="mt-5 container mx-auto"><p>Product not found.</p></div>;
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
          <p className="text-xl font-semibold my-2">${product.price}</p>
          {product.inventory <= 3 ? (
            <p className="text-red-500">Only {product.inventory} left!</p>
          ) : (
            <p className="text-green-500">In stock: {product.inventory}</p>
          )}
          <div className="mt-4">
            <QuantitySelector quantity={quantity} onQuantityChange={setQuantity} />
            <p className="p-2"></p>
            <AddToCartButton product={product} quantity={quantity} />
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductPage;
