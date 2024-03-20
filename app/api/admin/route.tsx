// @/app/api/admin/route.tsx

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { z } from "zod";
export const dynamic = 'force-dynamic'

const prisma = new PrismaClient();

const ServerProductSchema = z.object({
  name: z.string().min(1, "Product name is required."),
  slug: z.string(),
  price: z.number().min(0, "Price must be a positive number."),
  inventory: z.number().min(0, "Inventory must be a positive number."),
  description: z.string().min(1, "Product description is required."),
  category: z.string(), // Keep this as string for initial validation
  imageName: z.string(),
}).transform(({ name, slug, price, inventory, description, category, imageName }) => ({
  name,
  slug,
  price,
  inventory,
  description,
  categoryId: parseInt(category, 10), // Transform string category to number
  image: imageName, // Use imageName for the image field
}));

// Define a schema for validating and transforming category data
const ServerCategorySchema = z.object({
  name: z.string().min(1, "Category name is required."),
  imageName: z.string(),
  link: z.string(),
}).transform(({ name, imageName, link }) => ({
  name,
  image: imageName, // Use imageName for the image field
  link,
}));

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (session?.user?.name !== "Admin") {
    return new NextResponse(JSON.stringify({ error: 'Not authenticated' }), { status: 401, headers: { "Content-Type": "application/json" } });
  }
  try {
    const body = await request.json();
    const { type, ...data } = body;

    if (type === 'product') {
      // Validate and transform product data
      const validatedProduct = ServerProductSchema.parse(data);
      const product = await prisma.product.create({
        data: validatedProduct,
      });
      return NextResponse.json(product);
    } else if (type === 'category') {
      // Validate and transform category data
      const validatedCategory = ServerCategorySchema.parse(data);
      const category = await prisma.category.create({
        data: validatedCategory,
      });
      return NextResponse.json(category);
    } else {
      throw new Error('Invalid submission type');
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('[ADMIN_POST]', error);
      return new NextResponse(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
    } else {
      console.error('[ADMIN_POST]', 'An unexpected error occurred');
      return new NextResponse(JSON.stringify({ error: 'An unexpected error occurred' }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
  }
}

export async function GET(request: NextRequest) {

}

export async function PATCH(request: NextRequest) {

}

export async function DELETE(request: NextRequest) {

}