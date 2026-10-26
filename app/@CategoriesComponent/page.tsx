// @/app/@CategoriesComponent/page.tsx
"use client"
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { Button } from '@/components/ui/button';

const useWindowSize = () => {
    const [windowSize, setWindowSize] = useState({
        width: 0,
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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [retry, setRetry] = useState(0);
    const [hoveredCategoryIndex, setHoveredCategoryIndex] = useState<number | null>(null);
    const { width } = useWindowSize();

    useEffect(() => {
        setHoveredCategoryIndex(null);
    }, []);

    useEffect(() => {
        const fetchCategories = async () => {
            setLoading(true);
            setError(false);
            try {
                const { data } = await axios.get('/api/categories');
                setCategories(data);
            } catch { setError(true); }
            finally { setLoading(false); }
        };

        fetchCategories();
    }, [retry]);

    return (
        <div className="categories">
            <h2 className="mb-4">Categories</h2>
            {loading && <p role="status" className="py-8 text-gray-500">Loading categories…</p>}
            {error && <div role="alert" className="space-y-3 py-8"><p>Categories are temporarily unavailable.</p><Button variant="outline" onClick={() => setRetry(value => value + 1)}>Retry</Button></div>}
            {!loading && !error && !categories.length && <p className="py-8 text-gray-500">New categories are coming soon.</p>}
            <div className="mt-4 p-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {categories.map((category, index) => {
                        const isHovered = index === hoveredCategoryIndex;

                        // Ensure X is within 1-3 range
                        const xValue = (index % 3) + 1;

                        // Ensure Y is within 1-3 range, capping at 3
                        const yValue = Math.floor(index / 3) + 1; // Remove the capping to determine the actual row

                        // Determine if the index is beyond a 3x3 grid
                        const isBeyondGrid = yValue > 3;

                        // Construct the background image name, but only if within a 3x3 grid
                        const bgImageName = !isBeyondGrid ? `image${xValue}x${Math.min(yValue, 3)}.png` : null;

                        // Determine the background image based on screen size, hover state, and grid position
                        const bgImage = (width !== undefined && width <= 768) || isHovered || isBeyondGrid || !bgImageName ? category.image : bgImageName;
                        return (
                            <Link key={index} href={category.link}>
                                <div
                                    className="block relative bg-gray-200 shadow-lg bg-cover bg-center cursor-pointer transition-transform duration-300 hover:scale-[1.04] motion-reduce:transform-none"
                                    onMouseEnter={() => setHoveredCategoryIndex(index)}
                                    onMouseLeave={() => setHoveredCategoryIndex(null)}
                                    style={{
                                        paddingBottom: '100%',
                                        backgroundImage: `url('${bgImage}')`
                                    }}
                                >
                                    <div className="absolute bottom-2.5 left-2.5 text-white bg-black bg-opacity-50 p-1 text-lg font-bold">
                                        {category.name}
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default CategoriesComponent;
