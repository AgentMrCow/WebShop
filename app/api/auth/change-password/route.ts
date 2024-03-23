// @/app/api/auth/change-password/route.tsx

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next"
import { hash, compare } from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { changePWSchema } from '@/app/zod';
import DOMPurify from 'isomorphic-dompurify';
import { verifyCsrfToken } from '@/app/api/csrf';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

const sanitizeInput = (input: string): string => {
    return DOMPurify.sanitize(input);
};

export async function POST(request: NextRequest, response: NextResponse) {

    const session = await getServerSession();

    console.log(session)

    if (!session) {
        return new NextResponse(JSON.stringify({ error: 'Not authenticated' }), { status: 401, headers: { "Content-Type": "application/json" } });
    }

    if (!verifyCsrfToken()) {
        return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 })
      }

    const body = await request.json();
    let data;
    try {
        const sanitizedBody = {
            ...body,
            currentPassword: sanitizeInput(body.currentPassword),
            newPassword: sanitizeInput(body.newPassword),
            confirmPassword: sanitizeInput(body.confirmPassword),
        };
        data = changePWSchema.parse(sanitizedBody);
    } catch (error) {
        return new NextResponse(JSON.stringify({ error: 'Validation failed' }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    const { currentPassword, newPassword } = data;


    if (session.user?.email == null) {
        return new NextResponse(JSON.stringify({ error: 'Email address is missing' }), { status: 400, headers: { "Content-Type": "application/json" } });

    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    });

    if (!user) {
        return new NextResponse(JSON.stringify({ error: 'User not found' }), { status: 404, headers: { "Content-Type": "application/json" } });
    }

    const passwordValid = await compare(currentPassword, user.password);

    if (!passwordValid) {
        return new NextResponse(JSON.stringify({ error: 'Incorrect current password' }), { status: 403, headers: { "Content-Type": "application/json" } });
    }

    const hashedPassword = await hash(newPassword, 10);

    await prisma.user.update({
        where: { email: session.user.email },
        data: { password: hashedPassword },
    });
    return NextResponse.json('Password updated successfully');
}
