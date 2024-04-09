// @/app/(protected)/admin/layout.tsx
"use client"
import React, { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button, buttonVariants } from "@/components/ui/button"
import { DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem, DropdownMenuContent, DropdownMenu } from "@/components/ui/dropdown-menu"
import { useSession, signOut } from 'next-auth/react';
import { MessageSquare, LogOut } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { toast } from '@/components/ui/use-toast';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { data: session, status } = useSession();
    const pathname = usePathname();
    const [userCount, setUserCount] = useState(0);
    const [orderCount, setOrderCount] = useState(0);
    const [productCount, setProductCount] = useState(0);

    useEffect(() => {
        axios.post('/api/user')
            .then(response => setUserCount(response.data.length))
            .catch(error => toast({
                title: "Failed to fetch users:",
                description: `${error}`,
            }));

        axios.put('/api/order')
            .then(response => setOrderCount(response.data.length))
            .catch(error => toast({
                title: "Failed to fetch orders:",
                description: `${error}`,
            }));

        axios.get('/api/products')
            .then(response => setProductCount(response.data.length))
            .catch(error => toast({
                title: "Failed to fetch products:",
                description: `${error}`,
            }));
    }, []);

    const isActive = (path: string) => pathname === path;

    if (session?.user?.name !== "Admin" || session.user.provider === "google" || session.user.provider === "github") {
        return (
            <div>
                <h1>Access Denied</h1>
                <p></p>
                <p>Hi, <strong>{session?.user?.email ? session.user.email : "still loading, try to refresh"}</strong>,</p>
                <p>You are login from <strong className="text-green-600">{session?.user?.provider ? session.user.provider : "LOADING..."}</strong> and not an <strong className="text-red-600">Admin User</strong></p>
                <p>You <strong>do not</strong> have the necessary permissions to access the admin page.</p>
                <Button onClick={() => signOut()}>Click here to logout and relogin as an admin user</Button>
            </div>
        );
    }

    const pathSegments = pathname.split('/');
    const path = pathSegments.pop() || 'admin';
    const pageTitle = path === 'admin' ? 'Dashboard' : path.charAt(0).toUpperCase() + path.slice(1);


    return (
        <div className="admin-page-container">
            <div className="grid min-h-screen w-full overflow-hidden lg:grid-cols-[280px_1fr]">
                <div className="hidden border-r bg-gray-100/40 lg:block dark:bg-gray-800/40">
                    <div className="flex flex-col gap-2">
                        <div className="flex h-[60px] items-center px-6">
                            <Link className="flex items-center gap-2 font-semibold" href="/admin">
                                <Package2Icon className="h-6 w-6" />
                                <span className="">Admin Panel</span>
                            </Link>
                        </div>
                        <div className="flex-1">
                            <nav className="grid items-start px-4 text-sm font-medium">
                                <Link
                                    className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${isActive('/admin') ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50'
                                        }`} href="/admin"
                                >
                                    <HomeIcon className="h-4 w-4" />
                                    Home
                                </Link>
                                <Link
                                    className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${isActive('/admin/orders') ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50'
                                        }`} href="/admin/orders"
                                >
                                    <ShoppingCartIcon className="h-4 w-4" />
                                    Orders
                                    <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">{orderCount}</Badge>
                                </Link>
                                <Link
                                    className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${isActive('/admin/products') ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50'
                                        }`} href="/admin/products"
                                >
                                    <PackageIcon className="h-4 w-4" />
                                    Products
                                    <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">{productCount}</Badge>
                                </Link>
                                <Link
                                    className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${isActive('/admin/customers') ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50'
                                        }`} href="/admin/customers"
                                >
                                    <UsersIcon className="h-4 w-4" />
                                    Customers
                                    <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">{userCount}</Badge>
                                </Link>
                                <Link
                                    className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${isActive('/admin/settings') ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50'
                                        }`} href="/admin/settings"
                                >
                                    <SettingsIcon className="h-4 w-4" />
                                    Settings
                                </Link>
                            </nav>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col">
                    <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-gray-100/40 px-6 dark:bg-gray-800/40">
                        <Link className="lg:hidden" href="/admin">
                            <Package2Icon className="h-6 w-6" />
                            <span className="sr-only">Home</span>
                        </Link>
                        <div className="flex-1">
                            <h1 className="font-semibold text-lg">{pageTitle}</h1>
                        </div>
                        <div className="flex flex-1 items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
                            <form className="ml-auto flex-1 sm:flex-initial">
                                <div className="relative">
                                    <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                                    <Input
                                        className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px] bg-white"
                                        placeholder="     Search..."
                                        type="search"
                                    />
                                </div>
                            </form>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button className="rounded-full" size="icon" variant="ghost">
                                        <img
                                            alt="Avatar"
                                            className="rounded-full"
                                            height="32"
                                            src="/user-svgrepo-com.svg"
                                            style={{
                                                aspectRatio: "32/32",
                                                objectFit: "cover",
                                            }}
                                            width="32"
                                        />
                                        <span className="sr-only">Toggle user menu</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem><Link className="flex items-center" href="/admin/settings">
                                        <SettingsIcon className="mr-2 h-4 w-4" /><span>Settings</span>
                                    </Link></DropdownMenuItem>
                                    <DropdownMenuItem><Link className="flex items-center" href="mailto:khzhang@ie.cuhk.edu.hk">
                                        <MessageSquare className="mr-2 h-4 w-4" /><span>Support</span>
                                    </Link></DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className='cursor-pointer' onClick={() => signOut()} >
                                        <LogOut className="mr-2 h-4 w-4" /><span>Logout</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </header>
                    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
                        <div className="grid gap-4 md:gap-6">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    )
}


function HomeIcon(props: React.SVGProps<SVGSVGElement>) {
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
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
    )
}


function Package2Icon(props: React.SVGProps<SVGSVGElement>) {
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
            <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
            <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9" />
            <path d="M12 3v6" />
        </svg>
    )
}


function PackageIcon(props: React.SVGProps<SVGSVGElement>) {
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
            <path d="m7.5 4.27 9 5.15" />
            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
            <path d="m3.3 7 8.7 5 8.7-5" />
            <path d="M12 22V12" />
        </svg>
    )
}


function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
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
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
        </svg>
    )
}


function SettingsIcon(props: React.SVGProps<SVGSVGElement>) {
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
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    )
}


function ShoppingCartIcon(props: React.SVGProps<SVGSVGElement>) {
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
            <circle cx="8" cy="21" r="1" />
            <circle cx="19" cy="21" r="1" />
            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
        </svg>
    )
}


function UsersIcon(props: React.SVGProps<SVGSVGElement>) {
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
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    )
}
