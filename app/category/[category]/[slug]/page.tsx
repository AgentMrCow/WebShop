// @/app/category/[category]/[slug]/page.tsx
"use client"
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Breadcrumbs from '@/app/(component)/breadcrumbs';
import AddToCartButton from '@/app/(component)/AddToCartButton';
import QuantitySelector from '@/app/@QuantitySelector/page';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@/app/globals.css';

interface Category {
  id: number;
  name: string;
  link: string;
  image: string;
  products?: Product[];
}

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  inventory: number;
  description: string;
  categoryId: number;
  image: string;
  Category: Category;
}

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
          <img src={product.image} alt={product.name} className="img-fluid" />
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
          <AddToCartButton product={product} />
          <QuantitySelector />
        </div>
      </div>
    </>
  );
};

export default ProductPage;