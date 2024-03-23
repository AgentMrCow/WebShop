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
import { GitHubLogoIcon } from '@radix-ui/react-icons';

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

    const Oauth = async (provider: "google" | "github") => {
        const result = await signIn(provider, {
            redirect: false,
        });
    
        if (!result?.error) {
            router.push('/');
            router.refresh;
        } else {
            console.error('Sign-in failed:', result?.error);
            toast({
                title: "Failed to sign in",
                description: result?.error,
            });
        }
    };
    



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
                        <div className="flex flex-col space-y-2">
                            <Button variant="outline" onClick={() => Oauth('google')}>
                                <svg className="w-6 h-6 mr-2" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="48" height="48" viewBox="0 0 48 48">
                                    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                                </svg>
                                Continue with Google
                            </Button>
                            <Button onClick={() => Oauth('github')}>
                                <GitHubLogoIcon className="w-6 h-6 mr-2" />
                                Continue with GitHub
                            </Button>
                        </div>

                        <div className="text-center my-4 flex items-center justify-center">
                            <div className="border-t border-gray-500 flex-grow mr-2"></div>
                            <span className="bg-white px-4 text-sm text-gray-700">Or</span>
                            <div className="border-t border-gray-500 flex-grow ml-2"></div>
                        </div>


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
                        <div>No account? Sign up&nbsp;<Link href="/register" className="text-blue-500 hover:text-blue-700 font-semibold">here</Link>.</div>
                        <Button className="ml-auto" type="submit">
                            Login
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </Form>
    )
}
