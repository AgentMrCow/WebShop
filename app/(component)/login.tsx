// @/app/(component)/login.tsx
"use client"
import { CardTitle, CardDescription, CardHeader, CardContent, CardFooter, Card } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { signIn, signOut, getSession, useSession } from 'next-auth/react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { toast } from "@/components/ui/use-toast"
import { loginFormSchema, loginFormValues, changePWSchema, changePWValues } from '@/app/zod';
import { GitHubLogoIcon } from '@radix-ui/react-icons';
import { User } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import Image from "next/image";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from "@/components/ui/input-otp"


interface Item {
    name: string;
    quantity: number;
    price: number;
}

interface OrderDetails {
    items: Item[];
    total: string;
    currency: string;
}

interface Order {
    uuid: string;
    orderDetails: string;
    createdAt: Date;
}


export default function LoginComponent() {
    const router = useRouter();
    const pathname = usePathname();
    const { data: session, status } = useSession();
    const [orders, setOrders] = useState<Order[]>([]);
    const [value, setValue] = React.useState("")

    const loginForm = useForm<loginFormValues>({
        resolver: zodResolver(loginFormSchema),
        defaultValues: {
            email: "",
            password: ""
        },
        mode: "onChange",
    });


    const changePW = useForm<changePWValues>({
        resolver: zodResolver(changePWSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
        mode: "onChange",
    });

    useEffect(() => {
        const fetchOrders = async () => {
            if (session?.user?.email) {
                try {
                    const response = await axios.post('/api/order', {
                        email: session.user.email,
                    });
                    setOrders(response.data);
                } catch (error) {
                    console.error('Error fetching orders:', error);
                }
            }
        };
        fetchOrders();
    }, [session?.user?.email]);

    async function onLoginSubmit(data: loginFormValues) {
        const { email, password } = data;

        const response = await signIn('credentials', {
            email: email,
            password: password,
            redirect: false,
        });

        // toast({
        //     title: "Response",
        //     description: `${response}`,
        // });

        if (!response?.error) {
            const session = await getSession();
            if (session?.user?.name === "Admin") {
                router.push('/admin');
            } else {
                router.push('/');
            }
            router.refresh();
        } else {
            toast({
                title: "Failed to login",
                description: `${response?.error}`,
            });
        }
    }

    async function changePWSubmit(data: changePWValues) {

        try {
            //const csrfToken = cookies().get('next-auth.csrf-token')?.value.split('|')[0]

            const response = await axios.post('/api/auth/change-password', data);

            const result = response.data;

            if (response.status === 200) {
                signOut();
            } else {
                toast({
                    title: "Failed to change password",
                    description: `${result.error}`,
                });
            }
        }
        catch (error) {
            toast({
                title: "Failed to change password",
                description: `${error}`,
            });
        }
    }

    // const Oauth = async (provider: "google" | "github") => {
    //     const result = await signIn(provider, {
    //         redirect: false,
    //     });

    //     if (!result?.error) {
    //         router.push('/');
    //         router.refresh;
    //     } else {
    //         console.error('Sign-in failed:', result?.error);
    //         toast({
    //             title: "Failed to sign in",
    //             description: result?.error,
    //         });
    //     }
    // };




    if (!!session) {
        if (session.user?.provider === "google" || session.user?.provider === "github") {
            return (
                <Card className="p-4 text-center">
                    <CardContent>
                        {
                            session.user?.image ? (
                                <div className="w-20 h-20 rounded-full mx-auto relative overflow-hidden">
                                    <Image
                                        src={session.user.image}
                                        alt="Profile Picture"
                                        layout="fill"
                                        objectFit="cover"
                                    />
                                </div>
                            ) : (
                                <User className="w-20 h-20 mx-auto" />
                            )
                        }

                        <CardTitle>Welcome back, {session.user?.name || "User"}!</CardTitle>
                        <CardDescription>
                            You are logged in with {session.user?.provider} email: {session.user?.email} !
                        </CardDescription>

                        {session.user?.provider === "google" && (
                            <Link href="https://myaccount.google.com/security" target="_blank" rel="noopener noreferrer">
                                <Button variant="outline" className="mt-4 inline-flex items-center">
                                    <svg className="w-6 h-6 mr-2" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="48" height="48" viewBox="0 0 48 48">
                                        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                                    </svg>
                                    Google Account Security
                                </Button>
                            </Link>
                        )}
                        {session.user?.provider === "github" && (
                            <Link href="https://github.com/settings/security" target="_blank" rel="noopener noreferrer">
                                <Button className="mt-4 inline-flex items-center">
                                    <GitHubLogoIcon className="w-6 h-6 mr-2" />
                                    GitHub Account Security
                                </Button>
                            </Link>
                        )}
                        <Accordion type="single" collapsible className="w-full">
                            {orders.map((order) => {
                                const orderDate = new Date(order.createdAt);
                                const dateString = orderDate.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
                                const timeString = orderDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

                                let orderDetails: OrderDetails | null = null;
                                try {
                                    const parsed = JSON.parse(order.orderDetails);
                                    if (parsed && parsed.items) {
                                        orderDetails = parsed as OrderDetails;
                                    }
                                } catch (error) {
                                    console.error("Error parsing order details", error);
                                }

                                return (
                                    <AccordionItem key={order.uuid} value={order.uuid}>
                                        <AccordionTrigger>{order.uuid}</AccordionTrigger>
                                        <AccordionContent>
                                            <p><strong>Date:</strong> {dateString}</p>
                                            <p><strong>Time:</strong> {timeString}</p>
                                            {orderDetails ? (
                                                <div>
                                                    <strong>Order Details:</strong>
                                                    <ul>
                                                        {orderDetails.items.map((item: Item, index: number) => (
                                                            <li key={index}>
                                                                {item.name} - Quantity: {item.quantity} - Price: ${item.price}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                    <p><strong>Total:</strong> {orderDetails.total} {orderDetails.currency}</p>
                                                </div>
                                            ) : (
                                                <p>No order details available.</p>
                                            )}
                                        </AccordionContent>
                                    </AccordionItem>
                                );
                            })}
                        </Accordion>
                    </CardContent>
                    <CardFooter>
                        <Button className="ml-auto" onClick={() => signOut()}>
                            Logout
                        </Button>
                    </CardFooter>
                </Card>
            );
        }

        return (

            <Form {...changePW}>
                <form onSubmit={changePW.handleSubmit(changePWSubmit)}>
                    <Card className="p-4">
                        <CardHeader>
                            <CardTitle>Welcome back, {session.user?.email || "User"}!</CardTitle>
                            <CardDescription>
                                {session.user?.name === "Admin" ? "You are an admin user." : "You are not an admin user."}
                                <br />{session.user?.name === "Admin" ? "You can change your password here or navigate to Admin Panel." : "You can change your password here."}
                            </CardDescription>
                        </CardHeader>
                        <Tabs defaultValue="account">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="account">Change password</TabsTrigger>
                                <TabsTrigger value="orders">Last 5 orders</TabsTrigger>
                            </TabsList>
                            <TabsContent value="account">
                                <CardContent>

                                    <FormField
                                        control={changePW.control}
                                        name="currentPassword"
                                        render={({ field }) => (
                                            <FormItem className="space-y-2">
                                                <FormLabel className="text-base">Current Password</FormLabel>
                                                <FormControl>
                                                    <Input id="currentPassword" type="password" placeholder="Enter your current password" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={changePW.control}
                                        name="newPassword"
                                        render={({ field }) => (
                                            <FormItem className="space-y-2">
                                                <FormLabel className="text-base">New Password</FormLabel>
                                                <FormControl>
                                                    <Input id="newPassword" type="password" placeholder="Enter your new password" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={changePW.control}
                                        name="confirmPassword"
                                        render={({ field }) => (
                                            <FormItem className="space-y-2">
                                                <FormLabel className="text-base">Confirm New Password</FormLabel>
                                                <FormControl>
                                                    <Input id="confirmPassword" type="password" placeholder="Confirm your new password" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />


                                </CardContent>
                                <CardFooter>
                                    <Button type="submit">
                                        Submit
                                    </Button>
                                    <div className="flex-grow text-center">
                                        {session.user?.name === "Admin" && (
                                            <Link href="/admin">
                                                <Button>
                                                    Admin
                                                </Button>
                                            </Link>
                                        )}
                                    </div>
                                    <Button className="ml-auto" onClick={() => signOut()}>
                                        Logout
                                    </Button>
                                </CardFooter>
                            </TabsContent>

                            <TabsContent value="orders">

                                <Accordion type="single" collapsible className="w-full">
                                    {orders.map((order) => {
                                        const orderDate = new Date(order.createdAt);
                                        const dateString = orderDate.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
                                        const timeString = orderDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

                                        let orderDetails: OrderDetails | null = null;
                                        try {
                                            const parsed = JSON.parse(order.orderDetails);
                                            if (parsed && parsed.items) {
                                                orderDetails = parsed as OrderDetails;
                                            }
                                        } catch (error) {
                                            console.error("Error parsing order details", error);
                                        }

                                        return (
                                            <AccordionItem key={order.uuid} value={order.uuid}>
                                                <AccordionTrigger>{order.uuid}</AccordionTrigger>
                                                <AccordionContent>
                                                    <p><strong>Date:</strong> {dateString}</p>
                                                    <p><strong>Time:</strong> {timeString}</p>
                                                    {orderDetails ? (
                                                        <div>
                                                            <strong>Order Details:</strong>
                                                            <ul>
                                                                {orderDetails.items.map((item: Item, index: number) => (
                                                                    <li key={index}>
                                                                        {item.name} - Quantity: {item.quantity} - Price: ${item.price}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                            <p><strong>Total:</strong> {orderDetails.total} {orderDetails.currency}</p>
                                                        </div>
                                                    ) : (
                                                        <p>No order details available.</p>
                                                    )}
                                                </AccordionContent>
                                            </AccordionItem>
                                        );
                                    })}

                                </Accordion>
                                <Button className="w-full" onClick={() => signOut()}>
                                    Logout
                                </Button>

                            </TabsContent>
                        </Tabs>
                    </Card>
                </form>
            </Form>

        );
    }

    const isLoginPage = pathname === '/login';

    if (isLoginPage) {
        return (
            <div className="flex sm:flex-row flex-col-reverse">
                <div className="flex-1 hidden sm:block relative">
                    <Image
                        alt="Login illustration"
                        layout="fill"
                        objectFit="cover"
                        src="/login2.webp"
                    />
                </div>
                <div className="flex-grow sm:max-w-md w-full sm:order-1 space-y-8">
                    <Form {...loginForm}>
                        <form onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
                            <Card>
                                <CardHeader className="space-y-2">
                                    <CardTitle className="text-3xl">Login</CardTitle>
                                    <CardDescription className="mt-2 text-sm text-gray-600 flex justify-between">
                                        {"Doesn't have an account yet?"}
                                        <Link className="font-medium text-purple-600 hover:text-purple-500" href="/register">
                                            Sign Up NOW!
                                        </Link>
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">

                                    <FormField
                                        control={loginForm.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem className="space-y-2">
                                                <FormLabel className="text-base">Email Address</FormLabel>
                                                <FormControl>
                                                    <Input id="email" type="email" placeholder="you@example.com" {...field} />
                                                </FormControl>
                                                <FormDescription>
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={loginForm.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem className="space-y-0">
                                                <FormLabel className="text-base flex justify-between">Password
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                className="font-medium text-purple-600 hover:text-purple-500 text-sm"
                                                                variant="link"
                                                            // onClick={(e) => {
                                                            //     e.preventDefault();
                                                            //     alert('You are stupid');
                                                            // }}
                                                            >
                                                                Forgot Password?
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent>
                                                            One-Time Password
                                                            <div className="flex justify-center space-x-0 p-4">                                                            <InputOTP maxLength={6} value={value} onChange={(value) => setValue(value)}>
                                                                <InputOTPGroup>
                                                                    <InputOTPSlot index={0} />
                                                                    <InputOTPSlot index={1} />
                                                                    <InputOTPSlot index={2} />
                                                                </InputOTPGroup>
                                                                <InputOTPSeparator />
                                                                <InputOTPGroup>
                                                                    <InputOTPSlot index={3} />
                                                                    <InputOTPSlot index={4} />
                                                                    <InputOTPSlot index={5} />
                                                                </InputOTPGroup>
                                                            </InputOTP>
                                                            </div>
                                                            <div className="text-center text-sm">
                                                                {value === "" ? (
                                                                    <>{"Please enter the one-time password we've telepathically sent to your brain."}</>
                                                                ) : value.length === 6 ? (
                                                                    <div className="text-red-500">
                                                                        Mind reading failed. Please ensure your brain waves are not being blocked by tin foil hats or skepticism.
                                                                    </div>
                                                                ) : (
                                                                    <>You entered: {value}</>
                                                                )}
                                                            </div>


                                                        </PopoverContent>
                                                    </Popover>
                                                </FormLabel>
                                                <FormControl>
                                                    <Input id="password" type="password" placeholder="Enter 8 characters or more" {...field} />
                                                </FormControl>
                                                <FormDescription>
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox id="remember-me"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    alert("Remember you? I can barely remember what I had for breakfast!👎");
                                                }} />
                                            <Label htmlFor="remember-me">Remember me</Label>
                                        </div>
                                    </div>
                                    <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white">LOGIN</Button>
                                    <div className="text-center my-4 flex items-center justify-center">
                                        <div className="border-t border-gray-500 flex-grow mr-2"></div>
                                        <span className="bg-white px-4 text-sm text-gray-700">Or Login With</span>
                                        <div className="border-t border-gray-500 flex-grow ml-2"></div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Button variant="outline" onClick={() => signIn('google', { callbackUrl: process.env.NEXTAUTH_URL })}>
                                            <svg className="w-6 h-6 mr-2" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="48" height="48" viewBox="0 0 48 48">
                                                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                                            </svg>
                                            Google
                                        </Button>
                                        <Button onClick={() => signIn('github', { callbackUrl: process.env.NEXTAUTH_URL })}>
                                            <GitHubLogoIcon className="w-6 h-6 mr-2" />
                                            GitHub
                                        </Button>
                                    </div>
                                </CardContent>
                                <CardFooter className="text-sm text-gray-600">
                                    {"By signing in, you are able to check the most recent five orders in the member portal."}
                                </CardFooter>
                            </Card>
                        </form>
                    </Form>
                </div>
            </div>
        );


    } else {
        return (
            <Card>
                <CardHeader className="space-y-2">
                    <Link href="/login">
                        <CardTitle className="text-3xl">Guest Login</CardTitle>
                        <CardDescription>Sign in to manage your purchase</CardDescription>
                    </Link>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col space-y-2">
                        <Button variant="outline" onClick={() => signIn('google', { callbackUrl: process.env.NEXTAUTH_URL })}>
                            <svg className="w-6 h-6 mr-2" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="48" height="48" viewBox="0 0 48 48">
                                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                            </svg>
                            Continue with Google
                        </Button>
                        <Button onClick={() => signIn('github', { callbackUrl: process.env.NEXTAUTH_URL })}>
                            <GitHubLogoIcon className="w-6 h-6 mr-2" />
                            Continue with GitHub
                        </Button>
                    </div>

                    <div className="text-center my-4 flex items-center justify-center">
                        <div className="border-t border-gray-500 flex-grow mr-2"></div>
                        <span className="bg-white px-4 text-sm text-gray-700">Or</span>
                        <div className="border-t border-gray-500 flex-grow ml-2"></div>
                    </div>

                    <div className="mb-4"></div>

                    <Link href="/login">
                        <Button className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-4 text-white hover:text-white/80 transition-colors duration-300 ease-in-out shadow" variant="outline">
                            <MailIcon className="w-6 h-6 mr-2" />
                            Continue with Email
                        </Button>
                    </Link>

                </CardContent>
                <CardFooter>
                    <div>No account? Sign up&nbsp;<Link href="/register" className="text-blue-500 hover:text-blue-700 font-semibold">here</Link>.</div>
                </CardFooter>
            </Card>
        )
    }


}

function MailIcon(props: React.SVGProps<SVGSVGElement>) {
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
            <rect width="20" height="16" x="2" y="4" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
    )
}