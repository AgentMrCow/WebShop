// @/app/actions.tsx
'use server';

import { saveFile, insertProductIntoDb, updateProductInDb, deleteProductFromDb, insertCategoryIntoDb, updateCategoryInDb, deleteCategoryFromDb } from '@/app/lib/db';
import { Category } from '@/app/(data)/data';

export const insertProduct = async (formData: FormData) => {
    const file = formData.get('image');
    if (file && file instanceof File) {
        const savedImagePath = await saveFile(file);
        formData.append('imagePath', savedImagePath); // Add imagePath to formData
        return insertProductIntoDb(Object.fromEntries(formData));
    }
    throw new Error('File processing error');
};

export const updateProduct = async (formData: FormData, productId: string) => {
    const file = formData.get('image');
    if (file && file instanceof File) {
        const savedImagePath = await saveFile(file);
        formData.append('imagePath', savedImagePath);
    }
    return updateProductInDb(Object.fromEntries(formData), productId);
};


// Ensure fetchCategories returns a promise with Category[]
export const fetchCategories = async (): Promise<Category[]> => {
    // Fetch categories from the database and return them
    return []; // Placeholder return, replace with actual data fetching logic
  };
export const deleteProduct = async () => {
};

export const insertCategory = async () => {
};

export const updateCategory = async () => {
};

export const deleteCategory = async () => {
};

