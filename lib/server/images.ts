import { randomUUID } from 'node:crypto';
import { prisma } from '../prisma';
import { HttpError, MAX_UPLOAD_BYTES } from './policy';

export function imageType(bytes: Uint8Array): string {
  if (bytes.length < 12 || bytes.length > MAX_UPLOAD_BYTES) throw new HttpError(400, 'Upload a valid image no larger than 2 MB.');
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 &&
    bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a) return 'image/png';
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg';
  const first = new TextDecoder('ascii').decode(bytes.slice(0, 12));
  if (first.startsWith('GIF87a') || first.startsWith('GIF89a')) return 'image/gif';
  if (first.slice(0, 4) === 'RIFF' && first.slice(8, 12) === 'WEBP') return 'image/webp';
  throw new HttpError(400, 'Only PNG, JPEG, GIF and WebP image contents are accepted.');
}

export async function saveImage(file: File, userId: string) {
  if (!file.size || file.size > MAX_UPLOAD_BYTES) throw new HttpError(400, 'Upload a valid image no larger than 2 MB.');
  const bytes = new Uint8Array(await file.arrayBuffer());
  const contentType = imageType(bytes);
  if (file.type && file.type !== contentType && !(file.type === 'image/jpg' && contentType === 'image/jpeg')) {
    throw new HttpError(400, 'The image contents do not match its file type.');
  }
  const id = randomUUID();
  await prisma.uploadedImage.create({ data: { id, userId, contentType, bytes, size: bytes.length } });
  return `/api/images/${id}`;
}
