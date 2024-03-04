// @/app/@CategoriesComponent/page.tsx
"use client"
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import axios from 'axios';
import "@/app/globals.css"

const CategoriesComponent: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [hoveredCategoryIndex, setHoveredCategoryIndex] = useState<number | null>(null);

    useEffect(() => {
        setHoveredCategoryIndex(null);
    }, []);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data } = await axios.get('/api/categories');
                setCategories(data);
            } catch (error) {
                console.error('Failed to fetch categories:', error);
            }
        };

        fetchCategories();
    }, []);

    return (
        <div className="categories">
            <h2 className="mb-4">Categories</h2>
            <div className="container mt-4 p-0">
                <div className="row g-2">
                    {categories.map((category, index) => {
                        const isHovered = index === hoveredCategoryIndex;
                        const bgImageName = index < 9 ? `image${(index % 3) + 1}x${Math.floor(index / 3) + 1}.png` : null;
                        const bgImage = isHovered || !bgImageName ? category.image : bgImageName;

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