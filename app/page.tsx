// @/app/page.tsx
import React from 'react';
import Breadcrumbs from '@/app/(component)/breadcrumbs';
import { CarouselPlugin } from '@/app/(component)/carousel';
import dynamic from 'next/dynamic';

const CategoriesComponent = dynamic(() => import('@/app/@CategoriesComponent/page'), { ssr: false });

const breadcrumbs = [
  { label: 'Home' },
];

const Home: React.FC = () => {
  return (
    <>
      <Breadcrumbs breadcrumbs={breadcrumbs} />
      <CarouselPlugin />
      <CategoriesComponent />
    </>
  );
};

export default Home;
