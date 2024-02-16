// @/app/admin/page.tsx
/*
import { CardTitle, CardDescription, CardHeader, CardContent, CardFooter, Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { SelectValue, SelectTrigger, SelectItem, SelectContent, Select } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

export default function AdminPage() {
  return (
    <div className="grid gap-4 md:gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Insert Product</CardTitle>
          <CardDescription>Enter the product details below</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:gap-6">
          <div className="grid gap-2">
            <Label className="text-base" htmlFor="category">
              Category
            </Label>
            <Select id="category" placeholder="Select a category">
              <SelectTrigger className="w-full">
                <SelectValue className="text-left" />
              </SelectTrigger>
              <SelectContent className="w-full">
                <SelectItem value="1">Electronics</SelectItem>
                <SelectItem value="2">Clothing</SelectItem>
                <SelectItem value="3">Books</SelectItem>
                <SelectItem value="4">Home & Garden</SelectItem>
                <SelectItem value="5">Health & Beauty</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label className="text-base" htmlFor="name">
              Name
            </Label>
            <Input id="name" placeholder="Enter the product name" required />
          </div>
          <div className="grid gap-2">
            <Label className="text-base" htmlFor="slug">
              Slug (for URL)
            </Label>
            <Input id="url" placeholder="Enter the product slug" required />
          </div>
          <div className="grid gap-2">
            <Label className="text-base" htmlFor="price">
              Price
            </Label>
            <Input id="price" placeholder="Enter the product price" required type="number" />
          </div>
          <div className="grid gap-2">
            <Label className="text-base" htmlFor="inventory">
              Inventory
            </Label>
            <Input id="inventory" placeholder="Enter the product inventory" required type="number" />
          </div>
          <div className="grid gap-2">
            <Label className="text-base" htmlFor="description">
              Description
            </Label>
            <Textarea id="description" placeholder="Enter the product description" required />
          </div>
          <div className="grid gap-2">
            <Label className="text-base">Image</Label>
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center gap-1">
              <div className="pointer-events-none flex items-center gap-2 text-sm">
                <ImageIcon className="h-6 w-6 text-gray-400" />
                <span className="font-medium text-gray-500">Drag and drop your files here</span>
              </div>
              <span className="text-xs text-gray-500">or</span>
              <Button size="sm" variant="outline">
                <UploadIcon className="h-3 w-3 mr-1.5 -translate-y-0.5" />
                Browse
              </Button>
              <input className="hidden" type="file" />
            </div>
            <div className="border border-gray-200 rounded-lg p-4 grid gap-4 text-sm">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-8 w-8 rounded-lg border border-gray-200 object-cover" />
                <div className="flex-1">
                  <div className="font-medium">IMG_1234.jpg</div>
                  <div className="text-xs text-gray-500">1.2MB</div>
                </div>
                <Button size="sm" variant="outline">
                  <XIcon className="h-3 w-3" />
                  Remove
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex gap-4">
          <Button>Insert</Button>
          <Button variant="outline">Reset</Button>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Insert Category</CardTitle>
          <CardDescription>Enter the category details below</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:gap-6">
          <div className="grid gap-2">
            <Label className="text-base" htmlFor="category-name">
              Name
            </Label>
            <Input id="category-name" placeholder="Enter the category name" />
          </div>
          <div className="grid gap-2">
            <Label className="text-base" htmlFor="category-link">
              Link (for URL)
            </Label>
            <Input id="category-link" placeholder="Enter the product link" required />
          </div>
          <div className="grid gap-2">
            <Label className="text-base">Image</Label>
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center gap-1">
              <div className="pointer-events-none flex items-center gap-2 text-sm">
                <ImageIcon className="h-6 w-6 text-gray-400" />
                <span className="font-medium text-gray-500">Drag and drop your files here</span>
              </div>
              <span className="text-xs text-gray-500">or</span>
              <Button size="sm" variant="outline">
                <UploadIcon className="h-3 w-3 mr-1.5 -translate-y-0.5" />
                Browse
              </Button>
              <input className="hidden" type="file" />
            </div>
            <div className="border border-gray-200 rounded-lg p-4 grid gap-4 text-sm">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-8 w-8 rounded-lg border border-gray-200 object-cover" />
                <div className="flex-1">
                  <div className="font-medium">IMG_1234.jpg</div>
                  <div className="text-xs text-gray-500">1.2MB</div>
                </div>
                <Button size="sm" variant="outline">
                  <XIcon className="h-3 w-3" />
                  Remove
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex gap-4">
          <Button>Insert</Button>
          <Button variant="outline">Reset</Button>
        </CardFooter>
      </Card>
    </div>
  )
}

function ImageIcon(props) {
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
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  )
}

function UploadIcon(props) {
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
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" x2="12" y1="3" y2="15" />
    </svg>
  )
}


function XIcon(props) {
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
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}
*/

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem, DropdownMenuContent, DropdownMenu } from "@/components/ui/dropdown-menu"
import { TableHead, TableRow, TableHeader, TableCell, TableBody, Table } from "@/components/ui/table"

export default function Component() {
  return (
    <div className="grid min-h-screen w-full overflow-hidden lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-gray-100/40 lg:block dark:bg-gray-800/40">
        <div className="flex flex-col gap-2">
          <div className="flex h-[60px] items-center px-6">
            <Link className="flex items-center gap-2 font-semibold" href="#">
              <Package2Icon className="h-6 w-6" />
              <span className="">Admin Panel</span>
            </Link>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-4 text-sm font-medium">
              <Link
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                href="#"
              >
                <HomeIcon className="h-4 w-4" />
                Home
              </Link>
              <Link
                className="flex items-center gap-3 rounded-lg bg-gray-100 px-3 py-2 text-gray-900  transition-all hover:text-gray-900 dark:bg-gray-800 dark:text-gray-50 dark:hover:text-gray-50"
                href="#"
              >
                <ShoppingCartIcon className="h-4 w-4" />
                Orders
                <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">12</Badge>
              </Link>
              <Link
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                href="#"
              >
                <PackageIcon className="h-4 w-4" />
                Products
              </Link>
              <Link
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                href="#"
              >
                <UsersIcon className="h-4 w-4" />
                Customers
              </Link>
              <Link
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                href="#"
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
          <Link className="lg:hidden" href="#">
            <Package2Icon className="h-6 w-6" />
            <span className="sr-only">Home</span>
          </Link>
          <div className="flex-1">
            <h1 className="font-semibold text-lg">Recent Orders</h1>
          </div>
          <div className="flex flex-1 items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
            <form className="ml-auto flex-1 sm:flex-initial">
              <div className="relative">
                <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                <Input
                  className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px] bg-white"
                  placeholder="     Search orders..."
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
                    src="/placeholder.svg"
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
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Support</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
          <div className="border shadow-sm rounded-lg p-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Order</TableHead>
                  <TableHead className="min-w-[150px]">Customer</TableHead>
                  <TableHead className="hidden md:table-cell">Channel</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="hidden sm:table-cell">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">#3210</TableCell>
                  <TableCell>Olivia Martin</TableCell>
                  <TableCell className="hidden md:table-cell">Online Store</TableCell>
                  <TableCell className="hidden md:table-cell">February 20, 2022</TableCell>
                  <TableCell className="text-right">$42.25</TableCell>
                  <TableCell className="hidden sm:table-cell">Shipped</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost">
                          <MoreHorizontalIcon className="w-4 h-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View order</DropdownMenuItem>
                        <DropdownMenuItem>Customer details</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">#3209</TableCell>
                  <TableCell>Ava Johnson</TableCell>
                  <TableCell className="hidden md:table-cell">Shop</TableCell>
                  <TableCell className="hidden md:table-cell">January 5, 2022</TableCell>
                  <TableCell className="text-right">$74.99</TableCell>
                  <TableCell className="hidden sm:table-cell">Paid</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost">
                          <MoreHorizontalIcon className="w-4 h-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View order</DropdownMenuItem>
                        <DropdownMenuItem>Customer details</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">#3204</TableCell>
                  <TableCell>Michael Johnson</TableCell>
                  <TableCell className="hidden md:table-cell">Shop</TableCell>
                  <TableCell className="hidden md:table-cell">August 3, 2021</TableCell>
                  <TableCell className="text-right">$64.75</TableCell>
                  <TableCell className="hidden sm:table-cell">Unfulfilled</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost">
                          <MoreHorizontalIcon className="w-4 h-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View order</DropdownMenuItem>
                        <DropdownMenuItem>Customer details</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">#3203</TableCell>
                  <TableCell>Lisa Anderson</TableCell>
                  <TableCell className="hidden md:table-cell">Online Store</TableCell>
                  <TableCell className="hidden md:table-cell">July 15, 2021</TableCell>
                  <TableCell className="text-right">$34.50</TableCell>
                  <TableCell className="hidden sm:table-cell">Shipped</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost">
                          <MoreHorizontalIcon className="w-4 h-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View order</DropdownMenuItem>
                        <DropdownMenuItem>Customer details</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">#3202</TableCell>
                  <TableCell>Samantha Green</TableCell>
                  <TableCell className="hidden md:table-cell">Shop</TableCell>
                  <TableCell className="hidden md:table-cell">June 5, 2021</TableCell>
                  <TableCell className="text-right">$89.99</TableCell>
                  <TableCell className="hidden sm:table-cell">Paid</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost">
                          <MoreHorizontalIcon className="w-4 h-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View order</DropdownMenuItem>
                        <DropdownMenuItem>Customer details</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">#3201</TableCell>
                  <TableCell>Adam Barlow</TableCell>
                  <TableCell className="hidden md:table-cell">Online Store</TableCell>
                  <TableCell className="hidden md:table-cell">May 20, 2021</TableCell>
                  <TableCell className="text-right">$24.99</TableCell>
                  <TableCell className="hidden sm:table-cell">Unfulfilled</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost">
                          <MoreHorizontalIcon className="w-4 h-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View order</DropdownMenuItem>
                        <DropdownMenuItem>Customer details</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">#3207</TableCell>
                  <TableCell>Sophia Anderson</TableCell>
                  <TableCell className="hidden md:table-cell">Shop</TableCell>
                  <TableCell className="hidden md:table-cell">November 2, 2021</TableCell>
                  <TableCell className="text-right">$99.99</TableCell>
                  <TableCell className="hidden sm:table-cell">Paid</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost">
                          <MoreHorizontalIcon className="w-4 h-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View order</DropdownMenuItem>
                        <DropdownMenuItem>Customer details</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">#3206</TableCell>
                  <TableCell>Daniel Smith</TableCell>
                  <TableCell className="hidden md:table-cell">Online Store</TableCell>
                  <TableCell className="hidden md:table-cell">October 7, 2021</TableCell>
                  <TableCell className="text-right">$67.50</TableCell>
                  <TableCell className="hidden sm:table-cell">Shipped</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost">
                          <MoreHorizontalIcon className="w-4 h-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View order</DropdownMenuItem>
                        <DropdownMenuItem>Customer details</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </main>
      </div>
    </div>
  )
}

function HomeIcon(props) {
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


function MoreHorizontalIcon(props) {
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
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </svg>
  )
}


function Package2Icon(props) {
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


function PackageIcon(props) {
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


function SearchIcon(props) {
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


function SettingsIcon(props) {
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


function ShoppingCartIcon(props) {
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


function UsersIcon(props) {
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
