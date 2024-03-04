// @/app/api/categories/[id]/route.tsx

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
export const dynamic = 'force-dynamic'

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
    try {


    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('[CATEGORY_ID_POST]', error);
            return new NextResponse(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
        } else {
            console.error('[CATEGORY_POST]', 'An unexpected error occurred');
            return new NextResponse(JSON.stringify({ error: 'An unexpected error occurred' }), { status: 500, headers: { "Content-Type": "application/json" } });
        }
    }
}

export async function GET(request: NextRequest) {
    try {


    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('[CATEGORY_ID_GET]', error);
            return new NextResponse(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
        } else {
            console.error('[CATEGORY_ID_GET]', 'An unexpected error occurred');
            return new NextResponse(JSON.stringify({ error: 'An unexpected error occurred' }), { status: 500, headers: { "Content-Type": "application/json" } });
        }
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const categoryId = parseInt(params.id, 10);

    if (isNaN(categoryId)) {
        return new NextResponse(JSON.stringify({ error: 'Invalid category ID' }), { status: 400, headers: { "Content-Type": "application/json" } });
    }
    const body = await request.json();
    const data = body;

    try {

        const { name, imageName, link } = data;

        const category = await prisma.category.update({
            where: { id: categoryId },
            data: {
                name,
                link,
                image: imageName,
            },
        });
        return NextResponse.json(category);

    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('[CATEGORY_ID_PATCH]', error);
            return new NextResponse(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
        } else {
            console.error('[CATEGORY_ID_PATCH]', 'An unexpected error occurred');
            return new NextResponse(JSON.stringify({ error: 'An unexpected error occurred' }), { status: 500, headers: { "Content-Type": "application/json" } });
        }
    }
}


export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const categoryId = parseInt(params.id, 10);

    if (isNaN(categoryId)) {
        return new NextResponse(JSON.stringify({ error: 'Invalid category ID' }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    try {
        await prisma.product.deleteMany({
            where: { categoryId: categoryId },
        });
        await prisma.category.delete({
            where: { id: categoryId },
        });
        return new NextResponse(null, { status: 204 });
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('[CATEGORY_ID_DELETE]', error);
            return new NextResponse(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
        } else {
            console.error('[CATEGORY_ID_DELETE]', 'An unexpected error occurred');
            return new NextResponse(JSON.stringify({ error: 'An unexpected error occurred' }), { status: 500, headers: { "Content-Type": "application/json" } });
        }
    }
}