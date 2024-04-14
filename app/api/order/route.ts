// @/app/api/order/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth/next"

const prisma = new PrismaClient();

export async function POST(req: NextRequest, res: NextResponse) {
    const session = await getServerSession();
    if (!session) {
        return new NextResponse(JSON.stringify({ error: 'Not authenticated' }), { status: 401, headers: { "Content-Type": "application/json" } });
    }
    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
        return new NextResponse(JSON.stringify({ error: 'Email is required and must be a string.' }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    try {
        const orders = await prisma.order.findMany({
            where: { username: email },
            orderBy: { createdAt: 'desc' },
            take: 5,
        });
        return new NextResponse(JSON.stringify(orders), { status: 200, headers: { "Content-Type": "application/json" } });
    } catch (error) {
        return new NextResponse(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
}

export async function PUT(req: NextRequest, res: NextResponse) {
    const session = await getServerSession();
    if (session?.user?.name !== "Admin") {
        return new NextResponse(JSON.stringify({ error: 'Not authenticated' }), { status: 401, headers: { "Content-Type": "application/json" } });
    }
    try {
        const orders = await prisma.order.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return new NextResponse(JSON.stringify(orders), { status: 200, headers: { "Content-Type": "application/json" } });
    } catch (error) {
        console.error('Failed to fetch orders:', error);
        return new NextResponse(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
}