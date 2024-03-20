// @/app/api/products/[id]/route.tsx

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
export const dynamic = 'force-dynamic'

const ProductDataSchema = z.object({
    name: z.string(),
    slug: z.string(),
    price: z.number().min(0, "Price must be a positive number."),
    inventory: z.number().min(0, "Inventory must be a positive number."),
    description: z.string(),
    categoryId: z.number().min(1, "Category ID must be a positive number."),
    imageName: z.string(),
});


const prisma = new PrismaClient();

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const productId = parseInt(params.id, 10);

    if (isNaN(productId)) {
        return new NextResponse(JSON.stringify({ error: 'Invalid product ID' + params.id }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    try {
        const product = await prisma.product.findUnique({
            where: {
                id: productId,
            },
            include: {
                Category: true,
            },
        });

        if (!product) {
            return new NextResponse(JSON.stringify({ error: 'Product not found' }), { status: 404, headers: { "Content-Type": "application/json" } });
        }

        return new NextResponse(JSON.stringify(product), { status: 200, headers: { "Content-Type": "application/json" } });
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('[PRODUCT_ID_GET]', error);
            return new NextResponse(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
        } else {
            console.error('[PRODUCT_ID_GET]', 'An unexpected error occurred');
            return new NextResponse(JSON.stringify({ error: 'An unexpected error occurred' }), { status: 500, headers: { "Content-Type": "application/json" } });
        }
    }
}



export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession();

    if (session?.user?.name !== "Admin") {
        return new NextResponse(JSON.stringify({ error: 'Not authenticated' }), { status: 401, headers: { "Content-Type": "application/json" } });
    }

    const productId = parseInt(params.id, 10);
    if (isNaN(productId)) {
        return new NextResponse(JSON.stringify({ error: 'Invalid product ID' }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    try {
        const body = await request.json();

        const validatedData = ProductDataSchema.parse(body);

        let prismaData: any = {
            ...validatedData,
            image: validatedData.imageName,
        };
        delete prismaData.imageName;

        const product = await prisma.product.update({
            where: { id: productId },
            data: prismaData,
        });

        return NextResponse.json(product);
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('[PRODUCT_ID_PATCH]', error);
            return new NextResponse(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
        } else if (error instanceof z.ZodError) {
            return new NextResponse(JSON.stringify({ error: error.errors }), { status: 400, headers: { "Content-Type": "application/json" } });
        } else {
            console.error('[PRODUCT_ID_PATCH]', 'An unexpected error occurred');
            return new NextResponse(JSON.stringify({ error: 'An unexpected error occurred' }), { status: 500, headers: { "Content-Type": "application/json" } });
        }
    }
}


export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession();

    if (session?.user?.name !== "Admin") {
        return new NextResponse(JSON.stringify({ error: 'Not authenticated' }), { status: 401, headers: { "Content-Type": "application/json" } });
    }

    const productId = parseInt(params.id, 10);

    if (isNaN(productId)) {
        return new NextResponse(JSON.stringify({ error: 'Invalid product ID' }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    try {
        await prisma.product.delete({
            where: { id: productId },
        });
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        if (error instanceof Error) {
            console.error('[PRODUCT_ID_DELETE]', error);
            return new NextResponse(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
        } else {
            console.error('[PRODUCT_ID_DELETE]', error);
            return new NextResponse(JSON.stringify({ error: 'An unexpected error occurred' }), { status: 500, headers: { "Content-Type": "application/json" } });
        }
    }
}

/*
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {


    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('[PRODUCT_ID_POST]', error);
            return new NextResponse(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
        } else {
            console.error('[PRODUCT_ID_POST]', 'An unexpected error occurred');
            return new NextResponse(JSON.stringify({ error: 'An unexpected error occurred' }), { status: 500, headers: { "Content-Type": "application/json" } });
        }
    }
}
*/