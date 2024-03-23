// @/app/(component)/login.tsx
"use client"
import { useSession } from '@/app/(component)/SessionContext';
import { CardTitle, CardDescription, CardHeader, CardContent, CardFooter, Card } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { signIn, signOut, getSession } from 'next-auth/react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { toast } from "@/components/ui/use-toast"
import { loginFormSchema, loginFormValues, changePWSchema, changePWValues } from '@/app/zod';

export default function LoginComponent() {
    const router = useRouter();
    const session = useSession();

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

            const response = await axios.post('/api/auth/change-password');
            /*, data, {
                headers: {
                    'X-CSRF-Token': csrfToken,
                }
            });*/

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


    if (!!session) {
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
                    </Card>
                </form>
            </Form>
        );
    }



    return (
        <Form {...loginForm}>
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
                <Card>
                    <CardHeader className="space-y-2">
                        <Link href="/login">
                            <CardTitle className="text-3xl">Guest Login</CardTitle>
                            <CardDescription>Sign in to manage your purchase</CardDescription>
                        </Link>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField
                            control={loginForm.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem className="space-y-2">
                                    <FormLabel className="text-base">Email</FormLabel>
                                    <FormControl>
                                        <Input id="email" placeholder="Enter your email" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        {"hint: no hint :)"}
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={loginForm.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem className="space-y-2">
                                    <FormLabel className="text-base">Password</FormLabel>
                                    <FormControl>
                                        <Input id="password" type="password" placeholder="Enter your password" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        {"hint: only smart people can see"}
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                    <CardFooter>
                        No account? Sign up<Link href="/register" className="text-blue-500 hover:text-blue-700 font-semibold"> here</Link>.
                        <Button className="ml-auto" type="submit">
                            Login
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </Form>
    )
}
