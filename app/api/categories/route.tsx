// @/app/api/categories/route.tsx

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
export const dynamic = 'force-dynamic'

const prisma = new PrismaClient();

export async function PUT(request: NextRequest) {
    try {
        const categories = await prisma.category.findMany({
            include: {
                products: true,
            },
        });
        return NextResponse.json(categories);
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('[ADMIN_GET]', error);
            return new NextResponse(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
        } else {
            console.error('[ADMIN_GET]', 'An unexpected error occurred');
            return new NextResponse(JSON.stringify({ error: 'An unexpected error occurred' }), { status: 500, headers: { "Content-Type": "application/json" } });
        }
    }
}