// @/app/admin/page.tsx

"use client"

import React, { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { writeFile } from 'fs/promises'
import { join } from 'path'
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { cn } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button, buttonVariants } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem, DropdownMenuContent, DropdownMenu } from "@/components/ui/dropdown-menu"
import { TableHead, TableRow, TableHeader, TableCell, TableBody, Table } from "@/components/ui/table"
import { SelectValue, SelectTrigger, SelectItem, SelectContent, Select } from "@/components/ui/select"
import { CardTitle, CardDescription, CardHeader, CardContent, CardFooter, Card } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface Category {
  id: number;
  name: string;
  link: string;
  image: string;
  products?: Product[];
}

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  inventory: number;
  description: string;
  categoryId: number;
  image: string;
  Category: Category;
}

interface ProductRowProps {
  product: Product;
  onUpdate: (productData: any, id: number) => void;
  onDelete: (id: number) => void;
  categories: Category[];
}

interface CategoryRowProps {
  category: Category;
  handleCategoryUpdate: (id: number, updatedData: any) => void;
  handleCategoryDelete: (id: number) => void;
}

interface ProductData {
  name: string;
  slug: string;
  price: number;
  inventory: number;
  description: string;
  categoryId: number;
  imageName: string;
}

interface UpdatedCategoryData {
  name?: string;
  imageName?: string;
  link?: string;
}

interface ImageUploadFieldProps {
  onChange: (file: File | null) => void; // Adjust based on your actual usage
  onBlur: () => void; // Adjust based on your actual usage
  name: string;
  ref: React.Ref<any>; // You can specify a more specific type instead of 'any'
}


function slugify(text: string) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

function createImageName(userInput: string, fileName: string): string {
  const extension = fileName.slice(fileName.lastIndexOf('.')); // Extract the file extension including the dot

  return '/' + userInput.toLowerCase() // Convert to lowercase
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars except underscores
    .replace(/\_\_+/g, '_') // Replace multiple underscores with single underscore
    .replace(/^_+/, '') // Trim underscore from start of text
    .replace(/_+$/, '') // Trim underscore from end of text
    + extension; // Use the extracted file extension
}


const productFormSchema = z.object({
  name: z.string().min(1, "Product name is required."),
  price: z.coerce.number().min(0, "Price must be a positive number."),
  inventory: z.coerce.number().min(0, "Inventory must be a positive number."),
  description: z.string().min(1, "Product description is required."),
  category: z.string().min(1, "Please select a category."),
  image: z.instanceof(File)
    .refine((file) => file.size <= 5242880, `File size should be less than 5 MB.`)
    .refine(
      (file) => ["image/png", "image/gif", "image/jpg", "image/jpeg",].includes(file.type),
      "Only .jpg, .png, and .gif types are allowed."
    ),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

const categoryFormSchema = z.object({
  name: z.string().min(1, "Category name is required."),
  image: z.instanceof(File)
    .refine((file) => file.size <= 5242880, `File size should be less than 5 MB.`)
    .refine(
      (file) => ["image/png", "image/gif", "image/jpg", "image/jpeg"].includes(file.type),
      "Only .jpg, .png, and .gif types are allowed."
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

  const onSubmit = async (data: any) => {
    const { image, name, ...otherData } = data;
    const newImage = image?.[0];

    if (!newImage) {
      toast({
        title: 'Image Required',
        description: 'Please re-upload an image to update the product.(refresh this page after you see this message)',
      });
      return;
    }

    const slug = slugify(name);
    const imageName = createImageName(name, newImage.name);
    const nonImageData = {
      name,
      slug,
      price: parseFloat(otherData.price),
      inventory: parseInt(otherData.inventory, 10),
      categoryId: parseInt(otherData.categoryId, 10),
      description: otherData.description,
      imageName,
    };
    console.log(nonImageData);
    try {
      const response = await axios.patch(`/api/products/${product.id}`, nonImageData);

      console.log('Form data submitted successfully:', response.data);

      const imageFormData = new FormData();

      // Create a new Blob with the original image data but a new name
      const newImageFile = new Blob([await newImage.arrayBuffer()], { type: newImage.type });

      // Append the Blob as a File object, with the new name
      imageFormData.append('file', newImageFile, imageName.slice(1)); // Remove the '/' at the beginning for the actual file name

      const imageResponse = await axios.post(`/api/admin/image`, imageFormData);

      console.log('Product updated successfully:', imageResponse.data);

      toast({
        title: 'Success',
        description: 'Product updated successfully.',
      });

      // To TA, haven't implemented: Update local state or re-fetch products to reflect changes
    } catch (error) {
      console.error('Failed to update product:', error);
      toast({
        title: 'Error',
        description: 'Failed to update product.',
      });
    }
  };



  return (
    <TableRow key={product.id}>
      <TableCell>{product.id}</TableCell>
      <TableCell>
        <img src={imagePreview} alt={product.name} style={{ width: '50px', height: '50px' }} />
        <Input type="file" accept="image/png image/gif, image/jpg, image/jpeg" {...register('image')} />
      </TableCell>
      <TableCell>
        <Textarea {...register('name')} />
      </TableCell>
      <TableCell>
        <Input type="number" {...register('price')} />
      </TableCell>
      <TableCell>
        <Input type="number" {...register('inventory')} />
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
        <Button size="sm" onClick={handleSubmit(onSubmit)}>Save</Button>
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


  const onSubmit = async (data: any) => {
    const { image, name } = data;
    const newImage = image?.[0];

    if (!newImage) {
      toast({
        title: 'Image Required',
        description: 'Please re-upload an image to update the category. (refresh this page after you see this message)',
      });
      return;
    }
    const link = `/category/${slugify(name)}`;
    const imageName = createImageName(name, newImage.name);
    const nonImageData = {
      name,
      imageName,
      link,
    };

    try {
      const response = await axios.patch(`/api/categories/${category.id}`, nonImageData);

      const imageFormData = new FormData();
      if (newImage) {
        const newImageFile = new Blob([await newImage.arrayBuffer()], { type: newImage.type });
        imageFormData.append('file', newImageFile, imageName.slice(1)); // imageName.slice(1) to remove the leading '/'
      }

      const imageResponse = await axios.post(`/api/admin/image`, imageFormData);

      toast({
        title: 'Success',
        description: 'Category updated successfully.',
      });

    } catch (error) {
      console.error('Failed to update category:', error);
      toast({
        title: 'Error',
        description: 'Failed to update category.',
      });
    }
  };

  return (
    <TableRow>
      <TableCell>{category.id}</TableCell>
      <TableCell>
        <img src={imagePreview} alt={category.name} style={{ width: '50px', height: '50px' }} />
        <Input type="file" accept="image/png image/gif, image/jpg, image/jpeg" {...register('image')} />
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
        <Button size="sm" onClick={handleSubmit(onSubmit)}>Save</Button>
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
        if (file.type.startsWith('image/')) {
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
            description: 'Please upload an image file.',
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
          style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '200px' }}
        >
          {imagePreview ? (
            <img src={imagePreview} alt="Preview" className="mx-auto h-40" />
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
            accept=".png, .jpg, .jpeg, .gif"
            onChange={(e) => {
              const file = e.target.files ? e.target.files[0] : null;
              onChange(file);
              if (file) {
                if (!file.type.startsWith('image/')) {
                  toast({
                    title: 'Invalid file type',
                    description: 'Please upload an image file.',
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


export default function AdminPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [productImagePreview, setProductImagePreview] = useState('');
  const [categoryImagePreview, setCategoryImagePreview] = useState('');

  const resetCategoryImagePreview = () => setCategoryImagePreview('');
  const resetProductImagePreview = () => setProductImagePreview('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/api/categories');
        setCategories(response.data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('/api/products');
        setProducts(response.data);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      }
    };

    fetchProducts();
  }, []);

  const handleCategoryReset = () => {
    categoryForm.reset();
    resetCategoryImagePreview();
  };

  const handleProductReset = () => {
    productForm.reset();
    resetProductImagePreview();
  };

  const productForm = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      price: NaN,
      inventory: NaN,
      description: "",
      category: "",
      image: undefined,
    },
    mode: "onChange",
  });

  async function onProductSubmit(data: ProductFormValues) {
    // Separate the image data from the rest of the form data
    const { image, name, ...otherData } = data;

    // Generate slug from the product name
    const slug = slugify(name);

    const imageName = createImageName(name, image.name);

    const nonImageData = {
      type: 'product',
      ...otherData,
      name,
      slug,
      imageName,
    };

    try {
      const response = await axios.post('/api/admin', nonImageData);

      console.log('Form data submitted successfully:', response.data);

      const imageFormData = new FormData();

      // Create a new Blob with the original image data but a new name
      const newImageFile = new Blob([await image.arrayBuffer()], { type: image.type });

      // Append the Blob as a File object, with the new name
      imageFormData.append('file', newImageFile, imageName.slice(1)); // Remove the '/' at the beginning for the actual file name

      const imageResponse = await axios.post(`/api/admin/image`, imageFormData);

      console.log('Image submitted successfully:', imageResponse.data);

      toast({
        title: 'Product created',
        description: 'The product and its image have been successfully created.',
      });

    } catch (error) {
      console.error('Failed to submit product:', error);
      toast({
        title: 'Error',
        description: 'Failed to create product. Please make sure creating a product with an unique name.',
      });
    }
  }




  const categoryForm = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      image: undefined,
    },
    mode: "onChange",
  });

  async function onCategorySubmit(data: CategoryFormValues) {
    const { image, name } = data;

    // Generate a link and imageName based on the category name
    const link = `/category/${slugify(name)}`;
    const imageName = createImageName(name, image.name);

    const nonImageData = {
      type: 'category',
      name,
      imageName,
      link,
    };

    try {
      const response = await axios.post('/api/admin', nonImageData);

      console.log('Form data submitted successfully:', response.data);

      const imageFormData = new FormData();

      // Create a new Blob with the original image data but a new name
      const newImageFile = new Blob([await image.arrayBuffer()], { type: image.type });

      // Append the Blob as a File object, with the new name
      imageFormData.append('file', newImageFile, imageName.slice(1)); // Remove the '/' at the beginning for the actual file name

      const imageResponse = await axios.post(`/api/admin/image`, imageFormData);

      console.log('Image submitted successfully:', imageResponse.data);

      toast({
        title: 'Category created',
        description: 'The category and its image have been successfully created.',
      });

    } catch (error) {
      console.error('Failed to submit category:', error);
      toast({
        title: 'Error',
        description: 'Failed to create category. Please make sure creating a category with an unique name.',
      });
    }
  }

  const handleProductUpdate = async (productData: ProductData, id: number): Promise<void> => {
    try {
      await axios.patch(`/api/products/${id}`, productData);
      toast({ title: 'Product updated successfully' });
    } catch (error) {
      console.error('Failed to update product:', error);
      toast({ title: 'Error', description: 'Failed to update product' });
    }
  };


  const handleProductDelete = async (id: number): Promise<void> => {
    try {
      await axios.delete(`/api/products/${id}`);
      setProducts(products.filter((product) => product.id !== id));
      setCategories(categories.filter((category) => category.id !== id));
      toast({ title: 'Product deleted successfully' });
    } catch (error) {
      console.error('Failed to delete product:', error);
      toast({ title: 'Error', description: 'Failed to delete product' });
    }
  };

  const handleCategoryUpdate = async (id: number, updatedData: UpdatedCategoryData): Promise<void> => {
    try {
      await axios.patch(`/api/categories/${id}`, updatedData);
      toast({ title: 'Category updated successfully' });
    } catch (error) {
      console.error('Failed to update category:', error);
      toast({ title: 'Error', description: 'Failed to update category' });
    }
  };

  const handleCategoryDelete = async (id: number): Promise<void> => {
    try {
      await axios.delete(`/api/categories/${id}`);
      setCategories(categories.filter((category) => category.id !== id));
      setProducts(products.filter((product) => product.categoryId !== id));
      toast({ title: 'Category and associated products deleted successfully' });
    } catch (error) {
      console.error('Failed to delete category and its products:', error);
      toast({ title: 'Error', description: 'Failed to delete category and its products' });
    }
  };


  return (
    <div className="admin-page-container">
      {/* sidebar and header components */}

      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <div className="grid gap-4 md:gap-6">

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
                          <Input type="number" placeholder="Enter the product price" {...field} />
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
                          <Input type="number" placeholder="Enter the product inventory" {...field} />
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
                            console.error('Invalid image preview type');
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
                  <Button type="submit">Insert</Button>
                  <Button variant="outline" type="button" onClick={handleProductReset}>Reset</Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
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
                            console.error('Invalid image preview type');
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
                  <Button type="submit">Insert</Button>
                  <Button variant="outline" type="button" onClick={handleCategoryReset}>Reset</Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
        </div>
        <div className="border shadow-sm rounded-lg p-2 mb-8">
          <h2 className="text-lg font-semibold mb-4">Categories (Please re-upload the image to update.)</h2>
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
        <div className="border shadow-sm rounded-lg p-2 mb-8">
          <h2 className="text-lg font-semibold mb-4">Products (Please re-upload the image to update.)</h2>
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
      </main>
    </div>
  );
}

// To TA: not used, might be introduced in next phase
/*
export function Component() {
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
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                href="#"
              >
                <ShoppingCartIcon className="h-4 w-4" />
                Orders
                <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">12</Badge>
              </Link>
              <Link
                className="flex items-center gap-3 rounded-lg bg-gray-100 px-3 py-2 text-gray-900  transition-all hover:text-gray-900 dark:bg-gray-800 dark:text-gray-50 dark:hover:text-gray-50"
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
            <h1 className="font-semibold text-lg">Products</h1>
          </div>
          <div className="flex flex-1 items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
            <form className="ml-auto flex-1 sm:flex-initial">
              <div className="relative">
                <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                <Input
                  className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px] bg-white"
                  placeholder="     Search products..."
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
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Support</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
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
                  <Select>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a category" className="text-left" />
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
          <div className="border shadow-sm rounded-lg p-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Image</TableHead>
                  <TableHead className="max-w-[150px]">Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Inventory</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>
                    <img
                      alt=""
                      className="aspect-square rounded-md object-cover"
                      height="64"
                      src=""
                      width="64"
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    <Input id="name" defaultValue="Glimmer Lamps" required />
                  </TableCell>
                  <TableCell className="truncate">
                    <Input id="description" defaultValue="testing" required />
                  </TableCell>
                  <TableCell>
                    <Input id="price" defaultValue="99" required type="number" />
                  </TableCell>
                  <TableCell>
                    <Input id="inventory" defaultValue="500" required type="number" />
                  </TableCell>

                  <TableCell>
                    <Select defaultValue="1">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Electronics</SelectItem>
                        <SelectItem value="2">Clothing</SelectItem>
                        <SelectItem value="3">Books</SelectItem>
                        <SelectItem value="4">Home & Garden</SelectItem>
                        <SelectItem value="5">Health & Beauty</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline">
                      <UploadIcon className="h-3 w-3" />
                      Save
                    </Button>
                    <Button size="sm" variant="outline">
                      <XIcon className="h-3 w-3" />
                      Delete
                    </Button>
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
*/

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


function MoreHorizontalIcon(props: React.SVGProps<SVGSVGElement>) {
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


function XIcon(props: React.SVGProps<SVGSVGElement>) {
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