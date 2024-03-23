// @/app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcrypt';
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { PrismaClient } from '@prisma/client';
import { loginFormSchema } from '@/app/zod';

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
    CredentialsProvider({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials, req) {
        try {

          const validatedCredentials = loginFormSchema.parse(credentials);

          const user = await prisma.user.findUnique({
            where: {
              email: validatedCredentials.email,
            },
          });

          if (user) {
            const passwordCorrect = await compare(validatedCredentials.password, user.password);

            if (passwordCorrect) {
              return {
                id: user.id.toString(),
                email: user.email,
                isAdmin: user.isAdmin,
                name: user.isAdmin ? "Admin" : "User",
                Cookie_name: "Auth",
                sameSite: 'lax',
                httpOnly: true
              };
            }
          }

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
    session: ({ session, token }) => {
      console.log('Session Callback', { session, token })
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          isAdmin: token.isAdmin,
          Cookie_name: token.Cokkie_name,
          sameSite: token.sameSite,
          httpOnly: token.httpOnly
        }
      }
    },
    jwt: ({ token, user }) => {
      console.log('JWT Callback', { token, user })
      if (user) {
        const u = user as unknown as any
        return {
          ...token,
          id: u.id,
          isAdmin: u.isAdmin,
          Cookie_name: u.Cookie_name,
          sameSite: u.sameSite,
          httpOnly: u.httpOnly
        }
      }
      return token
    }
  }
})

export { handler as GET, handler as POST };