export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export { productById as GET, productById as PUT, updateProduct as PATCH, deleteProduct as DELETE } from '@/lib/server/api';
