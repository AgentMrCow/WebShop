// @/app/api/admin/route.tsx

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, ...data } = body;

    if (type === 'product') {
      const { name, slug, price, inventory, description, category, imageName } = data;
      const product = await prisma.product.create({
        data: {
          name,
          slug,
          price,
          inventory,
          description,
          categoryId: parseInt(category, 10),
          image: imageName,
        },
      });
      return NextResponse.json(product);
    } else if (type === 'category') {
      const { name, imageName, link } = data;
      const category = await prisma.category.create({
        data: {
          name,
          link,
          image: imageName,
        },
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