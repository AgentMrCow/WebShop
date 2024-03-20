// @/app/api/categories/[id]/route.tsx

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
export const dynamic = 'force-dynamic'

const UpdatedCategoryDataSchema = z.object({
    name: z.string().optional(),
    imageName: z.string().optional(),
    link: z.string().optional(),
});


const prisma = new PrismaClient();

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession();

    if (session?.user?.name !== "Admin") {
        return new NextResponse(JSON.stringify({ error: 'Not authenticated' }), { status: 401, headers: { "Content-Type": "application/json" } });
    }

    const categoryId = parseInt(params.id, 10);
    if (isNaN(categoryId)) {
        return new NextResponse(JSON.stringify({ error: 'Invalid category ID' }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    try {
        const body = await request.json();
        const validatedData = UpdatedCategoryDataSchema.parse(body);

        const prismaData = {
            ...validatedData,
            image: validatedData.imageName,
        };
        delete prismaData.imageName;

        const category = await prisma.category.update({
            where: { id: categoryId },
            data: prismaData,
        });

        return NextResponse.json(category);
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('[CATEGORY_ID_PATCH]', error);
            return new NextResponse(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
        } else if (error instanceof z.ZodError) {
            // Handle validation errors
            return new NextResponse(JSON.stringify({ error: error.errors }), { status: 400, headers: { "Content-Type": "application/json" } });
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

    const session = await getServerSession();

    if (session?.user?.name !== "Admin") {
        return new NextResponse(JSON.stringify({ error: 'Not authenticated' }), { status: 401, headers: { "Content-Type": "application/json" } });
    }

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

/*
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
*/
