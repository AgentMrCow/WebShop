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
import { useRouter } from 'next/navigation'
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react"
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import Link from 'next/link';
import axios from 'axios';

export default function RegisterForm() {

  const router = useRouter()

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

      const response = await axios.post('/api/auth/register', data);

      const result = response.data;

      if (response.status === 200) {
        router.push("/login")
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
            <CardDescription>By signing up, you agree to our <Link href="/register" className="text-blue-500 hover:text-blue-700 font-semibold">Terms of Service</Link>, <Link href="/register" className="text-blue-500 hover:text-blue-700 font-semibold">Privacy Policy</Link> and <Link href="/register" className="text-blue-500 hover:text-blue-700 font-semibold">Cookie Policy</Link>.</CardDescription>
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
                  <FormLabel className="text-base">Password</FormLabel>
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
                  <FormLabel className="text-base">Confirm Password</FormLabel>
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
                Register as an Admin user (not allowed XD).
              </Label>
            </div>
          </CardContent>
          <CardFooter>
            <div>Already have an account?&nbsp;<Link href="/login" className="text-blue-500 hover:text-blue-700 font-semibold">Login</Link>.</div>
            <Button className="ml-auto" type="submit">
              Register
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}
