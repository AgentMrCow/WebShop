// @/app/api/[slug]/route.tsx

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
export const dynamic = 'force-dynamic'

const prisma = new PrismaClient();

export async function GET(
    request: NextRequest,
    { params }: { params: { slug: string } }
) {
    const slug = params.slug;

    try {
        const product = await prisma.product.findUnique({
            where: { slug },
            include: { Category: true }
        });
        return NextResponse.json(product);
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('[PRODUCT_SLUG_GET]', error);
            return new NextResponse(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
        } else {
            console.error('[PRODUCT_SLUG_GET]', 'An unexpected error occurred');
            return new NextResponse(JSON.stringify({ error: 'An unexpected error occurred' }), { status: 500, headers: { "Content-Type": "application/json" } });
        }
    }
}
/*
export async function POST(
    request: NextRequest,
    { params }: { params: { slug: string } }
) {
    const slug = params.slug;
    try {


    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('[PRODUCT_SLUG_POST]', error);
            return new NextResponse(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
        } else {
            console.error('[PRODUCT_SLUG_POST]', 'An unexpected error occurred');
            return new NextResponse(JSON.stringify({ error: 'An unexpected error occurred' }), { status: 500, headers: { "Content-Type": "application/json" } });
        }
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: { slug: string } }
) {
    const slug = params.slug;
    try {

    }

    catch (error: unknown) {
        if (error instanceof Error) {
            console.error('[PRODUCT_SLUG_PATCH]', error);
            return new NextResponse(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
        } else {
            console.error('[PRODUCT_SLUG_PATCH]', 'An unexpected error occurred');
            return new NextResponse(JSON.stringify({ error: 'An unexpected error occurred' }), { status: 500, headers: { "Content-Type": "application/json" } });
        }
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { slug: string } }
) {
    const slug = params.slug;
    try {

    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('[PRODUCT_SLUG_DELETE]', error);
            return new NextResponse(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
        } else {
            console.error('[PRODUCT_SLUG_DELETE]', 'An unexpected error occurred');
            return new NextResponse(JSON.stringify({ error: 'An unexpected error occurred' }), { status: 500, headers: { "Content-Type": "application/json" } });
        }
    }
}
*/