// @/app/(component)/login.tsx
import Link from 'next/link';
import { CardTitle, CardDescription, CardHeader, CardContent, CardFooter, Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function Component() {
    return (
        <Card className="w-full max-w-md">
            <CardHeader className="space-y-2">
                <CardTitle className="text-3xl">Admin Login</CardTitle>
                <CardDescription>Sign in to access your admin panel</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" placeholder="Email" required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" placeholder="Password" required type="password" />
                </div>
            </CardContent>
            <CardFooter className="flex">
                <Link href="/admin" passHref>
                    <Button className="ml-auto" type="submit">
                        Login
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    )
}

