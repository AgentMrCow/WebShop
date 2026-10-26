import { getServerSession } from 'next-auth';
import { authOptions } from '../auth';
import { prisma } from '../prisma';
import { assertAdmin, assertSameOrigin, HttpError, record } from './policy';

export type Actor = { id: string; email: string; name: string | null; isAdmin: boolean };

export async function currentActor(): Promise<Actor> {
  const session = await getServerSession(authOptions);
  const id = session?.user?.id;
  if (typeof id !== 'string') throw new HttpError(401, 'Please sign in.');
  const user = await prisma.user.findUnique({ where: { id },
    select: { id: true, name: true, email: true, isAdmin: true } });
  if (!user || !user.email) throw new HttpError(401, 'Please sign in.');
  return { ...user, email: user.email };
}

export async function administrator(): Promise<Actor> {
  const actor = await currentActor();
  assertAdmin(actor);
  return actor;
}

export async function jsonBody(request: Request, maxBytes = 32_768): Promise<Record<string, unknown>> {
  assertSameOrigin(request);
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) {
    throw new HttpError(415, 'Use an application/json request.');
  }
  const length = Number(request.headers.get('content-length'));
  if (Number.isFinite(length) && length > maxBytes) throw new HttpError(413, 'Request is too large.');
  if (!request.body) throw new HttpError(400, 'A JSON body is required.');
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > maxBytes) {
      await reader.cancel();
      throw new HttpError(413, 'Request is too large.');
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  const raw = new TextDecoder().decode(bytes);
  try { return record(JSON.parse(raw)); } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(400, 'Invalid JSON.');
  }
}

export function json(value: unknown, status = 200): Response {
  return Response.json(value, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
}

export function route<T extends unknown[]>(handler: (...args: T) => Promise<Response>) {
  return async (...args: T): Promise<Response> => {
    try { return await handler(...args); }
    catch (error) {
      if (error instanceof HttpError) return json({ error: error.message }, error.status);
      const code = error && typeof error === 'object' && 'code' in error ? String(error.code) : '';
      if (code === 'P2002') return json({ error: 'This record already exists.' }, 409);
      if (code === 'P2003') return json({ error: 'This record is still in use.' }, 409);
      if (code === 'P2025') return json({ error: 'Record not found.' }, 404);
      console.error('WebShop request failed:', code || (error instanceof Error ? error.name : 'UnknownError'));
      return json({ error: 'The request could not be completed. Please try again.' }, 500);
    }
  };
}

export type IdContext = { params: Promise<{ id: string }> };
