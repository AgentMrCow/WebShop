// @/app/(protected)/admin/settings/page.tsx

"use client"
import * as React from "react"
import { useForm } from "react-hook-form";
import axios from 'axios';
import { signIn, signOut, getSession, useSession } from 'next-auth/react';
import { loginFormSchema, loginFormValues, changePWSchema, changePWValues } from '@/app/zod';
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/components/ui/use-toast"
import { Calendar } from "@/components/ui/calendar"
import { Switch } from "@/components/ui/switch"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

export default function Settings() {
    const [date, setDate] = React.useState<Date | undefined>(new Date())

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


    return (
        <Form {...changePW}>
            <form onSubmit={changePW.handleSubmit(changePWSubmit)}>
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
                <div className="m-4"></div>

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
                <div className="m-4"></div>

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

                <div className="m-4"></div>

                <Button type="submit">
                    Submit
                </Button>

                <div className="m-4"></div>

                System Date:

                <div className="m-4"></div>

                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border"
                />

                <div className="m-4"></div>


                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <FormLabel className="text-base">A good Design?</FormLabel>
                        <FormDescription>
                            Yes / Yes
                        </FormDescription>
                    </div>
                    <FormControl>
                        <Switch/>
                    </FormControl>
                </FormItem>

            </form>
        </Form>

    )
}

