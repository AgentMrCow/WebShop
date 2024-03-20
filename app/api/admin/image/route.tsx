// @/app/api/admin/image/route.tsx

import { writeFile } from 'fs/promises'
import { NextRequest, NextResponse } from 'next/server'
import path from 'path';
import { getServerSession } from 'next-auth';
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (session?.user?.name !== "Admin") {
    return new NextResponse(JSON.stringify({ error: 'Not authenticated' }), { status: 401, headers: { "Content-Type": "application/json" } });
  }

  const data = await request.formData()
  const file: File | null = data.get('file') as unknown as File

  if (!file) {
    return NextResponse.json({ success: false, error: 'No file uploaded' });
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const ext = path.extname(file.name).toLowerCase();

  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];

  if (!allowedExtensions.includes(ext)) {
    return NextResponse.json({ success: false, error: 'Invalid file type' });
  }

  if (buffer.length > 1024 * 1024 * 5) {
    return NextResponse.json({ success: false, error: 'File size exceeds limit' });
  }


  const uploadDir = path.join(process.cwd(), 'public');
  const filePath = path.join(uploadDir, file.name);

  await writeFile(filePath, buffer);
  console.log(`File saved to ${filePath}`);

  return NextResponse.json({ success: true });
}