// @/app/@CategoriesComponent/page.tsx
"use client"
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { categories } from '@/app/(data)/data';
import "@/app/globals.css"

const CategoriesComponent: React.FC = () => {
    const [hoveredCategoryIndex, setHoveredCategoryIndex] = useState<number | null>(null);

    // Reset hoveredCategoryIndex when component re-renders
    useEffect(() => {
        setHoveredCategoryIndex(null);
    }, []);

    return (
        <div className="categories">
            <h2 className="mb-4">Categories</h2>
            <div className="container mt-4 p-0">
                <div className="row g-2">
                    {categories.map((category, index) => {
                        const isHovered = index === hoveredCategoryIndex;
                        const bgImageName = `image${(index % 3) + 1}x${Math.floor(index / 3) + 1}.png`;
                        const bgImage = isHovered ? category.image : bgImageName;

                        return (
                            <div key={index} className="col-4 col-md-4">
                                <Link href={category.link}>
                                    <motion.div
                                        whileHover={{ scale: 1.04 }}
                                        transition={{ duration: 0.3 }}
                                        className="block relative bg-light shadow bg-cover bg-center"
                                        onMouseEnter={() => setHoveredCategoryIndex(index)}
                                        onMouseLeave={() => setHoveredCategoryIndex(null)}
                                        style={{
                                            paddingBottom: '100%',
                                            backgroundImage: `url('${bgImage}')`
                                        }}
                                        role="link"
                                        tabIndex={0}
                                    >
                                        <div className="absolute bottom-2.5 left-2.5 text-white bg-black bg-opacity-50 p-1 text-lg font-bold">
                                            {category.name}
                                        </div>
                                    </motion.div>
                                </Link>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default CategoriesComponent;