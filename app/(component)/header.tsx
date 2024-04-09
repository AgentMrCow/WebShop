// @/app/(component)/header.tsx
"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import axios from 'axios';
import ShoppingCartPage from '@/app/(component)/ShoppingCart';
import LoginComponent from '@/app/(component)/login';
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
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import Autoplay from "embla-carousel-autoplay"
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandSeparator, CommandShortcut } from "@/components/ui/command";
import { toast } from "@/components/ui/use-toast"
import { usePathname } from 'next/navigation';



const Header = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

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

        const fetchProducts = async () => {
            try {
                const { data } = await axios.get('/api/products');
                setProducts(data);
            } catch (error) {
                toast({
                    title: "Failed to fetch products",
                    description: `${error}`,
                });
            }
        };

        fetchCategories();
        fetchProducts();
    }, []);

    const pathname = usePathname();
    const isLoginPage = pathname === '/login';
    const isCheckoutPage = pathname === '/checkout';
    const isAdminPage = pathname.startsWith('/admin');



    const filteredProducts = products.filter(product => product.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <>
            {!isAdminPage && (
                <header className="bg-white shadow-sm">
                    <nav className="container mx-auto px-4 py-3 flex items-center ">
                        <div className="hidden sm:flex items-center">
                            <Link href="/" className="text-xl font-semibold text-gray-800">WebShop</Link>
                        </div>

                        <NavigationMenu>
                            <NavigationMenuList>
                                <NavigationMenuItem>
                                    <NavigationMenuTrigger className=" text-green-600 hover:text-green-800 transition-colors duration-150">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16" className="inline-block w-6 h-6">
                                            <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .49.598l-1 5a.5.5 0 0 1-.465.401l-9.397.472L4.415 11H13a.5.5 0 0 1 0 1H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5M3.102 4l.84 4.479 9.144-.459L13.89 4H3.102zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM5 13a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
                                        </svg>
                                    </NavigationMenuTrigger>
                                    <NavigationMenuContent>
                                        {!isCheckoutPage && (
                                            <ScrollArea className="absolute mt-1 py-2 bg-white shadow-lg rounded-md w-96 h-30">
                                                <ShoppingCartPage />
                                            </ScrollArea>
                                        )}
                                    </NavigationMenuContent>
                                </NavigationMenuItem>
                            </NavigationMenuList>
                        </NavigationMenu>
                        <NavigationMenu>
                            <NavigationMenuList>
                                <NavigationMenuItem>
                                    <NavigationMenuTrigger className="text-pink-600 hover:text-pink-800 transition-colors duration-150">
                                        <UserIcon />
                                    </NavigationMenuTrigger>
                                    <NavigationMenuContent>
                                        {!isLoginPage && !isCheckoutPage && (
                                            <ScrollArea className="absolute mt-1 py-2 bg-white shadow-lg rounded-md w-96 h-30">
                                                <LoginComponent />
                                            </ScrollArea>
                                        )}
                                    </NavigationMenuContent>
                                </NavigationMenuItem>
                            </NavigationMenuList>
                        </NavigationMenu>

                        <NavigationMenu className="mr-14">
                            <NavigationMenuList>
                                <NavigationMenuItem>
                                    <NavigationMenuTrigger>
                                        Search Products...
                                    </NavigationMenuTrigger>
                                    <NavigationMenuContent className="z-10 mt-1 py-2 bg-white shadow-lg rounded-md max-h-[calc(100vh-4rem)] overflow-y-auto">
                                        {!isCheckoutPage && (
                                            <Command className="grid w-40 p-2">
                                                <CommandInput placeholder="Search products..." className="h-9" onValueChange={(defaultValue) => setSearchQuery(defaultValue)} />
                                                <CommandList>
                                                    {
                                                        filteredProducts.map((product) => (
                                                            <Link defaultValue={product.id} key={product.id} href={`${product.Category.link}/${product.slug}`} className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 hover:text-blue-500 transition-colors duration-150">
                                                                <Image src={product.image} alt={product.name} width={40} height={40} className="rounded-md" />
                                                                <span>{product.name}</span>
                                                            </Link>
                                                        ))
                                                    }
                                                </CommandList>
                                            </Command>
                                        )}
                                    </NavigationMenuContent>
                                </NavigationMenuItem>
                            </NavigationMenuList>
                        </NavigationMenu>
                        <NavigationMenu className='hidden sm:flex'>
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
                                                        {!isCheckoutPage && (
                                                            <div className="grid w-40 sm:w-64 md:w-80 lg:w-[42rem] xl:w-[42rem] 2xl:w-[48rem] p-2">
                                                                <div className="p-2">
                                                                    <NavigationMenuLink asChild>
                                                                        <Link href={category.link} className="flex items-center gap-2 p-2  hover:bg-gray-100 hover:text-blue-500 transition-colors duration-150 font-bold">
                                                                            <Image src={category.image} alt={category.name} className="w-10 h-10 object-cover rounded-md" height={64} width={64} />
                                                                            View All {category.name}
                                                                        </Link>
                                                                    </NavigationMenuLink>
                                                                </div>
                                                                {products.filter(product => product.categoryId === category.id).map((product) => (
                                                                    <NavigationMenuLink key={product.id} asChild>
                                                                        <Link href={`${category.link}/${product.slug}`} className="flex items-center gap-2 p-2  hover:bg-gray-100 hover:text-blue-500 transition-colors duration-150">
                                                                            <Image src={product.image} alt={product.name} className="w-10 h-10 object-cover rounded-md" height={64} width={64} />
                                                                            {product.name}
                                                                        </Link>
                                                                    </NavigationMenuLink>
                                                                ))}
                                                            </div>
                                                        )}
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
            )}
        </>
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
