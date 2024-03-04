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

// @/app/(component)/AddToCartButton.tsx
interface AddToCartButtonProps {
    product: Product;
    quantity: number;
}

// @/app/@QuantitySelector/page.tsx
interface QuantitySelectorProps {
    quantity: number;
    onQuantityChange: (quantity: number) => void;
}

// @/app/(component)/CartContext.tsx
interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
    description?: string;
    image: string;
    categoryId: number;
}

interface CartContextType {
    items: CartItem[];
    addItem: (product: Product, quantity: number) => void;
    updateItemQuantity: (id: number, quantity: number) => void;
    removeItem: (id: number) => void;
    clearCart: () => void;
}

// @/app/(component)/breadcrumbs.tsx
interface BreadcrumbItem {
    label: string;
    path?: string;
}

interface BreadcrumbsProps {
    breadcrumbs: BreadcrumbItem[];
}
