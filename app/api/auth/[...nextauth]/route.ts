// @/app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcrypt';
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { PrismaClient } from '@prisma/client';
import { loginFormSchema } from '@/app/zod';
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github';
import { Session } from "next-auth";
import { JWT } from "next-auth/jwt";

// Extend the User type
interface ExtendedUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  isAdmin?: boolean;
  provider?: string;
}

// Extend the Session type to include the extended user
interface ExtendedSession extends Session {
  user?: ExtendedUser;
}

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID!;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET!;


const prisma = new PrismaClient();

const handler = NextAuth({
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24 * 3, // 3 days
  },
  useSecureCookies: true,
  pages: {
    signIn: '/login',
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
    }),
    GitHubProvider({
      clientId: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email", placeholder: "john.doe@example.com" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials, req) {
        try {

          const validatedCredentials = loginFormSchema.parse(credentials);

          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          const user = await prisma.user.findUnique({
            where: {
              email: validatedCredentials.email,
            },
          });
          if (!user || !user.password) {
            return null;
          }

          const passwordCorrect = await compare(validatedCredentials.password, user.password);
          if (!passwordCorrect) {
            return null;
          }

          return {
            id: user.id.toString(),
            email: user.email,
            isAdmin: user.isAdmin,
            name: user.isAdmin ? "Admin" : "User",
            // Cookie_name: "Auth",
            // sameSite: 'lax',
            // httpOnly: true
          };

          return null;

        } catch (error) {
          if (error) {
            console.error('Validation failed:', error);
            return null;
          }
          throw error;
        }
      },
    }),
  ],
  // callbacks: {
  //   async session({ session, token, user }: { session: ExtendedSession; token: JWT; user: any }): Promise<ExtendedSession> {
  //     if (session.user) {
  //       session.user.isAdmin = user.isAdmin;
  //       session.user.provider = user.provider;
  //     }
  //     console.log(session)
  //     return session;
  //   },
  // }
  // cookies: {
  //   sessionToken: {
  //     name: `__Secure-next-auth.session-token`,
  //     options: {
  //       httpOnly: true,
  //       sameSite: 'lax',
  //       path: '/',
  //       secure: true
  //     }
  //   },
  //   callbackUrl: {
  //     name: `__Secure-next-auth.callback-url`,
  //     options: {
  //       sameSite: 'lax',
  //       path: '/',
  //       secure: true
  //     }
  //   },
  //   csrfToken: {
  //     name: `__Host-next-auth.csrf-token`,
  //     options: {
  //       httpOnly: true,
  //       sameSite: 'lax',
  //       path: '/',
  //       secure: true
  //     }
  //   },
  // },
callbacks: {
  session: async ({ session, token }) => {
    console.log('Inside Session Callback', { session, token });
    if (session?.user) {
      session.user.id = token.id as string;
      session.user.isAdmin = token.isAdmin as boolean;
      session.user.provider = token.provider as string;
    }
    
    console.log('Updated Session', session);
    return session;
  },
  jwt: async ({ token, user, account }) => {
    console.log('Inside JWT Callback', { token, user, account });
    if (user) {
      token.id = user.id;
      token.isAdmin = user.isAdmin;
    }
    if (account) {
      token.provider = account.provider;
    }
    console.log('Updated Token', token);
    return token;
  }
}

})

export { handler as GET, handler as POST };
