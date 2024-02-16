// @/app/category/[category]/[slug]/page.tsx
import React from 'react';
import { products } from '@/app/(data)/data';
import Breadcrumbs from '@/app/(component)/breadcrumbs';
import AddToCartButton from '@/app/(component)/AddToCartButton';
import QuantitySelector from '@/app/@QuantitySelector/page';
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

  // Renamed 'productDetails' to 'product'
  const product = products.find(p => p.slug === slug);
  if (!product) {
    return <div className="container mt-5"><p>Product not found.</p></div>;
  }

  // Ensure the category string is capitalized and URL friendly
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
          <img src={product.thumbnail} alt={product.name} className="img-fluid" />
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