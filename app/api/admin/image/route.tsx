// @/app/api/admin/image/route.tsx

import { writeFile } from 'fs/promises'
import { NextRequest, NextResponse } from 'next/server'
import path from 'path';
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const data = await request.formData()
  const file: File | null = data.get('file') as unknown as File

  if (!file) {
    return NextResponse.json({ success: false })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const uploadDir = path.join(process.cwd(), 'public');
  const filePath = path.join(uploadDir, file.name);

  await writeFile(filePath, buffer);
  console.log(`File saved to ${filePath}`);

  return NextResponse.json({ success: true });
}