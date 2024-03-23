// @/app/register/form.tsx
"use client"
import { CardTitle, CardDescription, CardHeader, CardContent, CardFooter, Card } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { registerSchema, reigsterValues } from '@/app/zod';
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label";
import { redirect } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Link from 'next/link';
import axios from 'axios';

export default function RegisterForm() {

  const form = useForm<reigsterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });


  async function onRegister(data: reigsterValues) {

    try {
      const response = await axios.post('/api/auth/register');

      const result = response.data;

      if (response.status === 200) {
        redirect("/login")
      } else {
        toast({
          title: "Failed to register",
          description: `${result.error}`,
        });
      }
    }
    catch (error) {
      toast({
        title: "Failed to register",
        description: `${error}`,
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onRegister)}>
        <Card>
          <CardHeader className="space-y-2">
            <CardTitle className="text-3xl">Guest Registration</CardTitle>
            <CardDescription>Register to manage your purchase</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-base">Email</FormLabel>
                  <FormControl>
                    <Input id="email" placeholder="example4210@ie.cuhk.edu.hk" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-base">New Password</FormLabel>
                  <FormControl>
                    <Input id="newPassword" type="password" placeholder="The password must be 8-16 characters long and include both lowercase and uppercase letters, as well as digits." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-base">Confirm New Password</FormLabel>
                  <FormControl>
                    <Input id="confirmPassword" type="password" placeholder="The two passwords must match." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center space-x-2">
              <Checkbox id="Admin" disabled />
              <Label
                htmlFor="Admin"
                className="text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Register as an Admin user (not allow XD).
              </Label>
            </div>
          </CardContent>
          <CardFooter>
            Have an account? Sign in&nbsp;<Link href="/login" className="text-blue-500 hover:text-blue-700 font-semibold">here</Link>.
            <Button className="ml-auto" type="submit">
              Register
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}
