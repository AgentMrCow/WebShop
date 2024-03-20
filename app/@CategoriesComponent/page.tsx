// @/app/@CategoriesComponent/page.tsx
"use client"
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from "@/components/ui/use-toast"

const useWindowSize = () => {
    const [windowSize, setWindowSize] = useState({
        width: typeof window !== 'undefined' ? window.innerWidth : 0,
    });

    useEffect(() => {
        function handleResize() {
            setWindowSize({
                width: window.innerWidth,
            });
        }

        window.addEventListener("resize", handleResize);

        handleResize();

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return windowSize;
};

const CategoriesComponent: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [hoveredCategoryIndex, setHoveredCategoryIndex] = useState<number | null>(null);
    const { width } = useWindowSize();

    useEffect(() => {
        setHoveredCategoryIndex(null);
    }, []);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data } = await axios.get('/api/categories');
                setCategories(data);
            } catch (error) {
                toast({
                    title: "Failed to fetch categories",
                    description: `${error}`,
                });
            }
        };

        fetchCategories();
    }, []);

    return (
        <div className="categories">
            <h2 className="mb-4">Categories</h2>
            <div className="mt-4 p-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {categories.map((category, index) => {
                        const isHovered = index === hoveredCategoryIndex;
                        const bgImageName = `image${(index % 3) + 1}x${Math.floor(index / 3) + 1}.png`;
                        const bgImage = width !== undefined && width <= 768 ? category.image : (isHovered || !bgImageName ? category.image : bgImageName);

                        return (
                            <Link key={index} href={category.link}>
                                <motion.div
                                    whileHover={{ scale: 1.04 }}
                                    transition={{ duration: 0.3 }}
                                    className="block relative bg-gray-200 shadow-lg bg-cover bg-center cursor-pointer"
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
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default CategoriesComponent;
