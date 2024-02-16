// @/app/lib/db.ts
'use server';

import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';

const db = new Database('../../category.db');

export const insertProductIntoDb = (productData: any) => {
    const { categoryId, name, slug, price, thumbnail, description, inventory } = productData;
    const stmt = db.prepare('INSERT INTO products (categoryId, name, slug, price, thumbnail, description, inventory) VALUES (?, ?, ?, ?, ?, ?, ?)');
    const info = stmt.run(categoryId, name, slug, price, thumbnail, description, inventory);
    return info.lastInsertRowid;
};

export const updateProductInDb = (productData: any, productId: any) => {
    const { categoryId, name, slug, price, thumbnail, description, inventory } = productData;
    const stmt = db.prepare('UPDATE products SET categoryId = ?, name = ?, slug = ?, price = ?, thumbnail = ?, description = ?, inventory = ? WHERE id = ?');
    stmt.run(categoryId, name, slug, price, thumbnail, description, inventory, productId);
};

export const deleteProductFromDb = (productId: any) => {
    const stmt = db.prepare('DELETE FROM products WHERE id = ?');
    stmt.run(productId);
};

export const insertCategoryIntoDb = async (categoryData: any) => {
    // Implementation for inserting a category into the database
};

export const updateCategoryInDb = async (categoryData: any, categoryId: any) => {
    // Implementation for updating a category in the database
};

export const deleteCategoryFromDb = async (categoryId: any) => {
    // Implementation for deleting a category from the database
};

export const saveFile = async (file: File): Promise<string> => {
    const uploadDir = path.join(__dirname, 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = `${Date.now()}-${file.name}`;
    const filePath = path.join(uploadDir, fileName);

    const buffer = await file.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(buffer));

    return filePath;
};


// Implement insertProductIntoDb, updateProductInDb, deleteProductFromDb, insertCategoryIntoDb, updateCategoryInDb, deleteCategoryFromDb