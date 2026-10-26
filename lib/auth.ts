import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { compare, hash } from 'bcryptjs';
import { createHash, randomBytes } from 'node:crypto';
import { prisma } from './prisma';
import { email as validateEmail } from './server/policy';

let dummyHash: Promise<string> | undefined;

export function configuredProviders() {
  return {
    credentials: true,
    google: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    github: Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
  };
}

const enabled = configuredProviders();
const providers: NextAuthOptions['providers'] = [
  CredentialsProvider({
    name: 'Email and password',
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(credentials) {
      if (!credentials || typeof credentials.password !== 'string' || credentials.password.length > 72 ||
        Buffer.byteLength(credentials.password, 'utf8') > 72 || credentials.password.includes('\0')) return null;
      let normalizedEmail: string;
      try { normalizedEmail = validateEmail(credentials.email); } catch { return null; }

      const bucket = Math.floor(Date.now() / (15 * 60 * 1000));
      const key = createHash('sha256').update(`login:${bucket}:${normalizedEmail}`).digest('hex');
      const limit = await prisma.authRateLimit.upsert({
        where: { key }, update: { hits: { increment: 1 } },
        create: { key, hits: 1, expiresAt: new Date((bucket + 1) * 15 * 60 * 1000) },
      });
      if (limit.hits > 20) return null;
      await prisma.authRateLimit.deleteMany({ where: { expiresAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } } });

      const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
      dummyHash ??= hash(randomBytes(32).toString('base64url'), 12);
      const matches = await compare(credentials.password, user?.password ?? await dummyHash);
      if (!user || !user.password || !matches) return null;
      await prisma.authRateLimit.deleteMany({ where: { key } });
      return { id: user.id, name: user.name ?? user.email ?? 'Customer', email: user.email,
        image: user.image, isAdmin: user.isAdmin, sessionVersion: user.sessionVersion };
    },
  }),
];

if (enabled.google) providers.push(GoogleProvider({
  clientId: process.env.GOOGLE_CLIENT_ID!, clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
}));
if (enabled.github) providers.push(GitHubProvider({
  clientId: process.env.GITHUB_CLIENT_ID!, clientSecret: process.env.GITHUB_CLIENT_SECRET!,
}));

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt', maxAge: 60 * 60 * 24 * 3 },
  pages: { signIn: '/login' },
  providers,
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        const authenticatedVersion = (user as typeof user & { sessionVersion?: number }).sessionVersion;
        if (typeof authenticatedVersion === 'number') {
          token.sessionVersion = authenticatedVersion;
        } else {
          const stored = await prisma.user.findUnique({ where: { id: user.id }, select: { sessionVersion: true } });
          token.sessionVersion = stored?.sessionVersion ?? 0;
        }
      }
      if (account) token.provider = account.provider;
      return token;
    },
    async session({ session, token }) {
      if (!session.user || typeof token.id !== 'string') return { ...session, user: undefined };
      const user = await prisma.user.findUnique({ where: { id: token.id },
        select: { id: true, name: true, email: true, image: true, isAdmin: true, sessionVersion: true } });
      if (!user || token.sessionVersion !== user.sessionVersion) return { ...session, user: undefined };
      session.user.id = user.id;
      session.user.name = user.name ?? user.email ?? 'Customer';
      session.user.email = user.email;
      session.user.image = user.image;
      session.user.isAdmin = user.isAdmin;
      session.user.provider = typeof token.provider === 'string' ? token.provider : 'credentials';
      return session;
    },
  },
  logger: {
    error(code) { console.error('Authentication failed:', code); },
    warn(code) { console.warn('Authentication warning:', code); },
    debug() {},
  },
};
