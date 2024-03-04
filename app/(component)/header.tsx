// @/app/(component)/header.tsx
"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import axios from 'axios';
import ShoppingCartPage from '@/app/(component)/ShoppingCart';
import LoginPage from '@/app/(component)/login';
import {
    NavigationMenu,
    NavigationMenuList,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuTrigger,
    NavigationMenuContent,
} from "@/components/ui/navigation-menu";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import Autoplay from "embla-carousel-autoplay"



const Header = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [products, setProducts] = useState<Product[]>([]);

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

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const { data } = await axios.get('/api/products');
                setProducts(data);
            } catch (error) {
                console.error('Failed to fetch products:', error);
            }
        };
        fetchProducts();
    }, []);

    return (
        <header className="bg-white shadow-sm">
            <nav className="container mx-auto px-4 py-3 flex items-center ">
                <div className="flex items-center">
                    <Link href="/" className="text-xl font-semibold text-gray-800">WebShop</Link>
                </div>
                <NavigationMenu>
                    <NavigationMenuList>
                        <NavigationMenuItem>
                            <NavigationMenuTrigger>
                                <button className="text-green-600 hover:text-green-800 transition-colors duration-150">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16" className="inline-block w-6 h-6">
                                        <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .49.598l-1 5a.5.5 0 0 1-.465.401l-9.397.472L4.415 11H13a.5.5 0 0 1 0 1H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5M3.102 4l.84 4.479 9.144-.459L13.89 4H3.102zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM5 13a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
                                    </svg>
                                </button>
                            </NavigationMenuTrigger>
                            <NavigationMenuContent>
                                <ScrollArea className="absolute mt-1 py-2 bg-white shadow-lg rounded-md w-96 h-30">
                                    <ShoppingCartPage />
                                </ScrollArea>
                            </NavigationMenuContent>
                        </NavigationMenuItem>
                    </NavigationMenuList>
                </NavigationMenu>
                <NavigationMenu>
                    <NavigationMenuList>
                        <NavigationMenuItem className="mr-14">
                            <NavigationMenuTrigger>
                                <button className="text-pink-600 hover:text-pink-800 transition-colors duration-150">
                                    <UserIcon />
                                </button>
                            </NavigationMenuTrigger>
                            <NavigationMenuContent>
                                <ScrollArea className="absolute mt-1 py-2 bg-white shadow-lg rounded-md w-96 h-30">
                                    <LoginPage />
                                </ScrollArea>
                            </NavigationMenuContent>
                        </NavigationMenuItem>
                    </NavigationMenuList>
                </NavigationMenu>
                <NavigationMenu>
                    <NavigationMenuList>
                        <Carousel
                            className="max-w-40 sm:max-w-64 md:max-w-xs lg:max-w-2xl xl:max-w-2xl 2xl:max-w-3xl"
                            plugins={[
                                Autoplay({
                                    delay: 2000,
                                }),
                            ]}
                        >
                            <CarouselContent>
                                {categories.map((category, index) => (
                                    <NavigationMenuItem key={index}>
                                        <CarouselItem>
                                            <NavigationMenuTrigger className="text-gray-600 hover:text-gray-800 transition-colors duration-150">
                                                {category.name}
                                            </NavigationMenuTrigger>
                                            <NavigationMenuContent className="z-10 mt-1 py-2 bg-white shadow-lg rounded-md max-h-[calc(100vh-4rem)] overflow-y-auto">
                                                <div className="grid w-40 sm:w-64 md:w-80 lg:w-[42rem] xl:w-[42rem] 2xl:w-[48rem] p-2">
                                                    <div className="p-2">
                                                        <NavigationMenuLink asChild>
                                                            <Link href={category.link} className="flex items-center gap-2 p-2 hover:bg-gray-100 font-bold">
                                                                <Image src={category.image} alt={category.name} className="w-10 h-10 object-cover rounded-md" height={64} width={64} />
                                                                View All {category.name}
                                                            </Link>
                                                        </NavigationMenuLink>
                                                    </div>
                                                    {products.filter(product => product.categoryId === category.id).map((product) => (
                                                        <NavigationMenuLink key={product.id} asChild>
                                                            <Link href={`${category.link}/${product.slug}`} className="flex items-center gap-2 p-2 hover:bg-gray-100">
                                                                <Image src={product.image} alt={product.name} className="w-10 h-10 object-cover rounded-md" height={64} width={64} />
                                                                {product.name}
                                                            </Link>
                                                        </NavigationMenuLink>
                                                    ))}
                                                </div>
                                            </NavigationMenuContent>
                                        </CarouselItem>
                                    </NavigationMenuItem>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious />
                            <CarouselNext />
                        </Carousel>
                    </NavigationMenuList>
                </NavigationMenu>


            </nav>
        </header>
    );
};

export default Header;

function UserIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    )
}
