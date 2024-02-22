// @/app/types.tsx

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