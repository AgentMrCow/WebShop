// @/app/page.tsx
import React from 'react';
import Breadcrumbs from '@/app/(component)/breadcrumbs';
import { CarouselPlugin } from '@/app/(component)/carousel';
import CategoriesComponent from '@/app/@CategoriesComponent/page';

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
