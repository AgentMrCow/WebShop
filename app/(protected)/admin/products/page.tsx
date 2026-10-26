// @/app/(protected)/admin/products/page.tsx

"use client"

import React, { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import Image from 'next/image';
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { Button, buttonVariants } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { TableHead, TableRow, TableHeader, TableCell, TableBody, Table } from "@/components/ui/table"
import { SelectValue, SelectTrigger, SelectItem, SelectContent, Select } from "@/components/ui/select"
import { CardTitle, CardDescription, CardHeader, CardContent, CardFooter, Card } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"


interface ProductRowProps {
    product: Product;
    onUpdate: (productData: ProductData, id: number) => Promise<void>;
    onDelete: (id: number) => void;
    categories: Category[];
}

interface CategoryRowProps {
    category: Category;
    handleCategoryUpdate: (id: number, updatedData: UpdatedCategoryData) => Promise<void>;
    handleCategoryDelete: (id: number) => void;
}

interface ImageUploadFieldProps {
    onChange: (file: File | null) => void;
    onBlur: () => void;
    name: string;
    ref: React.Ref<any>;
}


function slugify(text: string) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
}

async function uploadImage(file: File): Promise<string> {
    if (file.size > 2 * 1024 * 1024 || !['image/png', 'image/jpeg', 'image/gif', 'image/webp'].includes(file.type)) {
        throw new Error('Choose a PNG, JPEG, GIF or WebP image up to 2 MB.');
    }
    const body = new FormData();
    body.append('file', file);
    const response = await axios.post('/api/admin/image', body);
    if (typeof response.data.url !== 'string') throw new Error('The image upload did not return a URL.');
    return response.data.url;
}

function requestError(error: unknown): string {
    return axios.isAxiosError(error) && typeof error.response?.data?.error === 'string'
        ? error.response.data.error : error instanceof Error ? error.message : 'Please try again.';
}

const productFormSchema = z.object({
    name: z.string().min(1, "Product name is required."),
    price: z.number().min(0, "Price must be a positive number."),
    inventory: z.number().int("Inventory must be a whole number.").min(0, "Inventory cannot be negative."),
    description: z.string().min(1, "Product description is required."),
    category: z.string().min(1, "Please select a category."),
    image: z.instanceof(File)
        .refine((file) => file.size <= 2097152, `File size should be less than 2 MB.`)
        .refine(
            (file) => ["image/png", "image/gif", "image/webp", "image/jpeg"].includes(file.type),
            "Only JPEG, PNG, GIF and WebP images are allowed."
        ),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

const categoryFormSchema = z.object({
    name: z.string().min(1, "Category name is required."),
    image: z.instanceof(File)
        .refine((file) => file.size <= 2097152, `File size should be less than 2 MB.`)
        .refine(
            (file) => ["image/png", "image/gif", "image/webp", "image/jpeg"].includes(file.type),
            "Only JPEG, PNG, GIF and WebP images are allowed."
        ),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;


const ProductRow = ({ product, onUpdate, onDelete, categories }: ProductRowProps) => {
    const { register, handleSubmit, setValue, watch } = useForm({
        defaultValues: {
            name: product.name,
            price: product.price,
            inventory: product.inventory,
            description: product.description,
            categoryId: product.categoryId.toString(),
            image: null
        },
    });

    const [imagePreview, setImagePreview] = useState(product.image); // State to hold the preview URL
    const watchImage = watch('image') as FileList | null; // Watch the image input field for changes

    // Effect to handle image file changes and create a preview URL
    useEffect(() => {
        if (watchImage && watchImage.length > 0) {
            const file = watchImage[0];
            const fileUrl = URL.createObjectURL(file);
            setImagePreview(fileUrl);

            // Cleanup function to revoke the object URL to avoid memory leaks
            return () => URL.revokeObjectURL(fileUrl);
        }
    }, [watchImage]);

    const [saving, setSaving] = useState(false);
    const onSubmit = async (data: any) => {
        setSaving(true);
        try {
            const imageName = data.image?.[0] ? await uploadImage(data.image[0]) : product.image;
            await onUpdate({ name: data.name, slug: slugify(data.name), price: Number(data.price),
                inventory: Number(data.inventory), categoryId: Number(data.categoryId),
                description: data.description, imageName }, product.id);
            setImagePreview(imageName);
        } catch (error) {
            toast({ title: 'Unable to update product', description: requestError(error), variant: 'destructive' });
        } finally { setSaving(false); }
    };

    return (
        <TableRow key={product.id}>
            <TableCell>{product.id}</TableCell>
            <TableCell>
                <div style={{ width: '50px', height: '50px', position: 'relative' }}>
                    <Image src={imagePreview} alt={product.name} sizes="100%" fill style={{ objectFit: 'cover' }} />
                </div>
                <Input type="file" accept=".png,.jpg,.jpeg,.gif,.webp" {...register('image')} />
            </TableCell>
            <TableCell>
                <Textarea {...register('name')} />
            </TableCell>
            <TableCell>
                <Input type="number" min="0" step="0.01" {...register('price')} />
            </TableCell>
            <TableCell>
                <Input type="number" min="0" step="1" {...register('inventory')} />
            </TableCell>
            <TableCell>
                <Textarea {...register('description')} />
            </TableCell>
            <TableCell>
                <select {...register('categoryId')}>
                    {categories.map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                </select>
            </TableCell>
            <TableCell>
                <Button type="button" size="sm" disabled={saving} onClick={handleSubmit(onSubmit)}>{saving ? 'Saving…' : 'Save'}</Button>
                <Button size="sm" variant="outline" onClick={() => onDelete(product.id)}>Delete</Button>
            </TableCell>
        </TableRow>
    );
};

const CategoryRow = ({ category, handleCategoryUpdate, handleCategoryDelete }: CategoryRowProps) => {
    const { register, handleSubmit, setValue, watch } = useForm({
        defaultValues: {
            name: category.name,
            image: null
        },
    });

    const [imagePreview, setImagePreview] = useState(category.image);
    const watchImage = watch('image') as FileList | null;

    // Handle image file changes and create a preview URL
    useEffect(() => {
        if (watchImage && watchImage.length > 0) {
            const file = watchImage[0];
            const fileUrl = URL.createObjectURL(file);
            setImagePreview(fileUrl);

            // Cleanup function to revoke the object URL to avoid memory leaks
            return () => URL.revokeObjectURL(fileUrl);
        }
    }, [watchImage]);


    const [saving, setSaving] = useState(false);
    const onSubmit = async (data: any) => {
        setSaving(true);
        try {
            const imageName = data.image?.[0] ? await uploadImage(data.image[0]) : category.image;
            await handleCategoryUpdate(category.id, { name: data.name, link: `/category/${slugify(data.name)}`, imageName });
            setImagePreview(imageName);
        } catch (error) {
            toast({ title: 'Unable to update category', description: requestError(error), variant: 'destructive' });
        } finally { setSaving(false); }
    };

    return (
        <TableRow>
            <TableCell>{category.id}</TableCell>
            <TableCell>
                <div style={{ width: '50px', height: '50px', position: 'relative' }}>
                    <Image src={imagePreview} alt={category.name} sizes="100%" fill style={{ objectFit: 'cover' }} />
                </div>
                <Input type="file" accept=".png,.jpg,.jpeg,.gif,.webp" {...register('image')} />
            </TableCell>
            <TableCell>
                <Input {...register('name')} />
            </TableCell>
            <TableCell>
                <ul className="list-disc list-inside">
                    {category.products?.map(product => (
                        <li key={product.id}>{product.name}</li>
                    ))}
                </ul>
            </TableCell>
            <TableCell>
                <Button type="button" size="sm" disabled={saving} onClick={handleSubmit(onSubmit)}>{saving ? 'Saving…' : 'Save'}</Button>
                <Button size="sm" variant="outline" onClick={() => handleCategoryDelete(category.id)}>Delete</Button>
            </TableCell>
        </TableRow>
    );
};

const ImageUploadField: React.FC<ImageUploadFieldProps & { imagePreview: string, setImagePreview: (preview: string | ArrayBuffer | null) => void }> = ({
    onChange,
    onBlur,
    name,
    ref,
    imagePreview,
    setImagePreview,
}) => {
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const onDrop = useCallback(
        (e: React.DragEvent<HTMLElement>) => {
            e.preventDefault();
            e.stopPropagation();
            setDragOver(false);
            const files = e.dataTransfer.files;
            if (files && files.length > 0) {
                const file = files[0];
                if (file.size <= 2097152 && ['image/png', 'image/jpeg', 'image/gif', 'image/webp'].includes(file.type)) {
                    onChange(file);
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        if (typeof reader.result === 'string') {
                            setImagePreview(reader.result as string)
                        }
                    };
                    reader.readAsDataURL(file);
                } else {
                    toast({
                        title: 'Invalid file type',
                        description: 'Choose a PNG, JPEG, GIF or WebP image up to 2 MB.',
                    });
                }
            }
        },
        [onChange, setImagePreview]
    );


    const onDragOver = (e: React.DragEvent<HTMLElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (!dragOver) setDragOver(true);
    };

    const onDragLeave = (e: React.DragEvent<HTMLElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (dragOver) setDragOver(false);
    };

    const openFileDialog = () => {
        fileInputRef.current?.click();
    };

    return (
        <FormItem>
            <FormLabel className="text-base">Image</FormLabel>
            <FormControl>
                <div
                    className={`border-dashed border-2 border-gray-300 p-4 text-center cursor-pointer ${dragOver ? 'bg-gray-100' : ''}`}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onClick={openFileDialog}
                    role="button"
                    tabIndex={0}
                    aria-label="Choose an image up to 2 MB"
                    onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openFileDialog(); } }}
                    style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '200px' }}
                >
                    {imagePreview ? (
                        <div className="relative mx-auto h-40 w-full">
                            <Image src={imagePreview} alt="Preview" sizes="100%" fill style={{ objectFit: 'contain' }} />
                        </div>
                    ) : (
                        <div>
                            <div className="pointer-events-none flex items-center gap-2 text-sm">
                                <ImageIcon className="h-6 w-6 text-gray-400" />
                                <span className="font-medium text-gray-500">Drag and drop your files here</span>
                            </div>
                            <span className="text-xs text-gray-500">{"or "} </span>
                            <Button size="sm" variant="outline" disabled style={{ opacity: 1 }}>
                                <UploadIcon className="h-3 w-3 mr-1.5 -translate-y-0.5" />
                                Browse
                            </Button>
                        </div>
                    )}
                    <Input
                        type="file"
                        onClick={event => event.stopPropagation()}
                        accept=".png,.jpg,.jpeg,.gif,.webp"
                        onChange={(e) => {
                            const file = e.target.files ? e.target.files[0] : null;
                            onChange(file);
                            if (file) {
                                if (file.size > 2097152 || !['image/png', 'image/jpeg', 'image/gif', 'image/webp'].includes(file.type)) {
                                    toast({
                                        title: 'Invalid file type',
                                        description: 'Choose a PNG, JPEG, GIF or WebP image up to 2 MB.',
                                    });
                                }
                                else {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                        if (typeof reader.result === 'string') {
                                            setImagePreview(reader.result);
                                        }
                                    };
                                    reader.readAsDataURL(file);
                                }
                            } else {
                                onChange(null);
                                setImagePreview('');
                            }
                        }}
                        onBlur={onBlur}
                        name={name}
                        ref={fileInputRef}
                        className="hidden"
                    />
                </div>
            </FormControl>
            <FormMessage />
            <FormDescription>
                Simply resubmit another image to replace the current one.
            </FormDescription>
        </FormItem>
    );
};


export default function ProductsPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [productImagePreview, setProductImagePreview] = useState('');
    const [categoryImagePreview, setCategoryImagePreview] = useState('');

    const resetCategoryImagePreview = () => setCategoryImagePreview('');
    const resetProductImagePreview = () => setProductImagePreview('');

    const refreshCatalogue = useCallback(async () => {
        const [categoryResponse, productResponse] = await Promise.all([
            axios.get<Category[]>('/api/categories'), axios.get<Product[]>('/api/products'),
        ]);
        setCategories(categoryResponse.data);
        setProducts(productResponse.data);
    }, []);
    useEffect(() => {
        refreshCatalogue().catch(error => toast({ title: 'Unable to load catalogue', description: requestError(error), variant: 'destructive' }));
    }, [refreshCatalogue]);

    const productForm = useForm<ProductFormValues>({
        resolver: zodResolver(productFormSchema),
        defaultValues: {
            name: "",
            price: 0,
            inventory: 0,
            description: "",
            category: "",
            image: undefined,
        },
        mode: "onChange",
    });

    const categoryForm = useForm<CategoryFormValues>({
        resolver: zodResolver(categoryFormSchema),
        defaultValues: {
            name: "",
            image: undefined,
        },
        mode: "onChange",
    });



    const handleCategoryReset = () => {
        categoryForm.reset();
        resetCategoryImagePreview();
    };

    const handleProductReset = () => {
        productForm.reset();
        resetProductImagePreview();
    };

    async function onProductSubmit(data: ProductFormValues) {
        try {
            const imageName = await uploadImage(data.image);
            await axios.post('/api/admin', { type: 'product', name: data.name, slug: slugify(data.name),
                price: data.price, inventory: data.inventory, description: data.description,
                category: data.category, imageName });
            await refreshCatalogue();
            handleProductReset();
            toast({ title: 'Product created', description: 'The product is now available in the catalogue.' });
        } catch (error) {
            toast({ title: 'Unable to create product', description: requestError(error), variant: 'destructive' });
        }
    }

    async function onCategorySubmit(data: CategoryFormValues) {
        try {
            const imageName = await uploadImage(data.image);
            await axios.post('/api/admin', { type: 'category', name: data.name, link: `/category/${slugify(data.name)}`, imageName });
            await refreshCatalogue();
            handleCategoryReset();
            toast({ title: 'Category created' });
        } catch (error) {
            toast({ title: 'Unable to create category', description: requestError(error), variant: 'destructive' });
        }
    }

    const handleProductUpdate = async (productData: ProductData, id: number): Promise<void> => {
        await axios.patch(`/api/products/${id}`, productData);
        await refreshCatalogue();
        toast({ title: 'Product updated successfully' });
    };
    const handleProductDelete = async (id: number): Promise<void> => {
        if (!window.confirm('Delete this product from the catalogue?')) return;
        try {
            await axios.delete(`/api/products/${id}`);
            await refreshCatalogue();
            toast({ title: 'Product deleted' });
        } catch (error) { toast({ title: 'Unable to delete product', description: requestError(error), variant: 'destructive' }); }
    };
    const handleCategoryUpdate = async (id: number, updatedData: UpdatedCategoryData): Promise<void> => {
        await axios.patch(`/api/categories/${id}`, updatedData);
        await refreshCatalogue();
        toast({ title: 'Category updated successfully' });
    };
    const handleCategoryDelete = async (id: number): Promise<void> => {
        if (!window.confirm('Delete this category? Move or remove its products first.')) return;
        try {
            await axios.delete(`/api/categories/${id}`);
            await refreshCatalogue();
            toast({ title: 'Category deleted' });
        } catch (error) { toast({ title: 'Unable to delete category', description: requestError(error), variant: 'destructive' }); }
    };

    return (
        <Accordion type="multiple" className="w-full">
            <AccordionItem value="product-card">
                <AccordionTrigger>Insert Product</AccordionTrigger>
                <AccordionContent>
                    <Form {...productForm}>
                        <form onSubmit={productForm.handleSubmit(onProductSubmit)} className="space-y-8">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Insert Product</CardTitle>
                                    <CardDescription>Enter the product details below</CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-4 md:gap-6">
                                    <FormField
                                        control={productForm.control}
                                        name="category"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base">Category</FormLabel>
                                                <FormControl>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select a category" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {categories.map(category => (
                                                                <SelectItem key={category.id} value={category.id.toString()}>
                                                                    {category.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </FormControl>
                                                <FormDescription>
                                                    {"You can add more categories in the another form, Insert Category"}
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={productForm.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base">Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter the product name" {...field} />
                                                </FormControl>
                                                <FormDescription>
                                                    {"name is unique, any duplication will lead to error during submitting, please keep it different with category's name"}
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={productForm.control}
                                        name="price"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base">Price</FormLabel>
                                                <FormControl>
                                                    <Input type="number" min="0" step="0.01" placeholder="Enter the product price" {...field} value={Number.isFinite(field.value) ? field.value : ''} onChange={event => field.onChange(event.target.valueAsNumber)} />
                                                </FormControl>
                                                <FormDescription>
                                                    {"cannot be negative, simply adjust it by inputting the value or pressing buttton ↑ or ↓ to adjust the value"}
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={productForm.control}
                                        name="inventory"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base">Inventory</FormLabel>
                                                <FormControl>
                                                    <Input type="number" min="0" step="1" placeholder="Enter the product inventory" {...field} value={Number.isFinite(field.value) ? field.value : ''} onChange={event => field.onChange(event.target.valueAsNumber)} />
                                                </FormControl>
                                                <FormDescription>
                                                    {"cannot be negative, simply adjust it by inputting the value or pressing buttton ↑ or ↓ to adjust the value"}
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={productForm.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base">Description</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="Enter the product description" {...field} />
                                                </FormControl>
                                                <FormDescription>
                                                    min 1 character, no max
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={productForm.control}
                                        name="image"
                                        render={({ field: { onChange, onBlur, name, ref } }) => (
                                            <ImageUploadField
                                                onChange={onChange}
                                                imagePreview={productImagePreview}
                                                setImagePreview={(preview) => {
                                                    if (preview instanceof ArrayBuffer || preview === null) {
                                                        toast({
                                                            title: "Invalid image preview type",
                                                        });
                                                        return;
                                                    }
                                                    setProductImagePreview(preview);
                                                }}
                                                onBlur={onBlur}
                                                name={name}
                                                ref={ref}
                                            />
                                        )}
                                    />
                                </CardContent>
                                <CardFooter className="flex gap-4">
                                    <Button type="submit" disabled={productForm.formState.isSubmitting}>Insert</Button>
                                    <Button variant="outline" type="button" onClick={handleProductReset}>Reset</Button>
                                </CardFooter>
                            </Card>
                        </form>
                    </Form>
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="category-card">
                <AccordionTrigger>Insert Category</AccordionTrigger>
                <AccordionContent>
                    <Form {...categoryForm}>
                        <form onSubmit={categoryForm.handleSubmit(onCategorySubmit)} className="space-y-8">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Insert Category</CardTitle>
                                    <CardDescription>Enter the category details below</CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-4 md:gap-6">
                                    <FormField
                                        control={categoryForm.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base">Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter the category name" {...field} />
                                                </FormControl>
                                                <FormDescription>
                                                    {"name is unique, any duplication will lead to error during submitting, please keep it different with product's name"}
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={categoryForm.control}
                                        name="image"
                                        render={({ field: { onChange, onBlur, name, ref } }) => (
                                            <ImageUploadField
                                                onChange={onChange}
                                                imagePreview={categoryImagePreview}
                                                setImagePreview={(preview) => {
                                                    if (preview instanceof ArrayBuffer || preview === null) {
                                                        toast({
                                                            title: "Invalid image preview type",
                                                        });
                                                        return;
                                                    }
                                                    setCategoryImagePreview(preview);
                                                }}
                                                onBlur={onBlur}
                                                name={name}
                                                ref={ref}
                                            />
                                        )}
                                    />
                                </CardContent>
                                <CardFooter className="flex gap-4">
                                    <Button type="submit" disabled={categoryForm.formState.isSubmitting}>Insert</Button>
                                    <Button variant="outline" type="button" onClick={handleCategoryReset}>Reset</Button>
                                </CardFooter>
                            </Card>
                        </form>
                    </Form>
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="categories-table">
                <AccordionTrigger>View / Update / Delete Categories</AccordionTrigger>
                <AccordionContent>
                    <div className="border shadow-sm rounded-lg p-2 mb-8">
                        <h2 className="text-lg font-semibold mb-4">Categories (image replacement is optional)</h2>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead></TableHead>
                                    <TableHead className="w-[80px]">Image</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Products</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {categories.map(category => (
                                    <CategoryRow
                                        key={category.id}
                                        category={category}
                                        handleCategoryUpdate={handleCategoryUpdate}
                                        handleCategoryDelete={handleCategoryDelete}
                                    />
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="products-table">
                <AccordionTrigger>View / Update / Delete Products</AccordionTrigger>
                <AccordionContent>
                    <div className="border shadow-sm rounded-lg p-2 mb-8">
                        <h2 className="text-lg font-semibold mb-4">Products (image replacement is optional)</h2>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Image</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Inventory</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {products.map((product) => (
                                    <ProductRow
                                        key={product.id}
                                        product={product}
                                        onUpdate={handleProductUpdate}
                                        onDelete={handleProductDelete}
                                        categories={categories}
                                    />
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
}


function ImageIcon(props: React.SVGProps<SVGSVGElement>) {
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

function UploadIcon(props: React.SVGProps<SVGSVGElement>) {
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

