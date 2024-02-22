// @/app/api/products/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const products = await prisma.product.findMany({
        include: { Category: true }
    });
    return NextResponse.json(products);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('[PRODUCTS_GET]', error);
      return new NextResponse(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
    } else {
      console.error('[PRODUCTS_GET]', 'An unexpected error occurred');
      return new NextResponse(JSON.stringify({ error: 'An unexpected error occurred' }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
  }
}
