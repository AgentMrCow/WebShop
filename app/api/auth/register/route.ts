// @/app/api/auth/register/route.tsx

import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { registerSchema } from '@/app/zod';
import DOMPurify from 'isomorphic-dompurify';

const prisma = new PrismaClient();

const sanitizeInput = (input: string): string => DOMPurify.sanitize(input);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const sanitizedBody = {
      ...body,
      email: sanitizeInput(body.email),
      newPassword: sanitizeInput(body.newPassword),
      confirmPassword: sanitizeInput(body.confirmPassword),
    };

    let data;
    try {
      data = registerSchema.parse(sanitizedBody);
    } catch (error) {
      return NextResponse.json({ error: 'Validation failed' }, { status: 400 });
    }

    const { email, newPassword } = data;

    const existingUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'A user with this email already exists.' }, { status: 400 });
    }

    const hashedPassword = await hash(newPassword, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    console.log({ user });
    return NextResponse.json({ message: 'Registration successful' });
  } catch (error) {
    console.error({ error });
    return NextResponse.json({ error: 'An error occurred.' }, { status: 500 });
  }
}

