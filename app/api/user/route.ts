// @/app/api/user/route.js

import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next"

const prisma = new PrismaClient();

export async function POST(req: NextRequest, res: NextResponse) {
    const session = await getServerSession();
    if (!session) {
        return new NextResponse(JSON.stringify({ error: 'Not authenticated' }), { status: 401, headers: { "Content-Type": "application/json" } });
    }
    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return new NextResponse(JSON.stringify(users), { status: 200, headers: { "Content-Type": "application/json" } });
    } catch (error) {
        console.error('Failed to fetch users:', error);
        return new NextResponse(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
}