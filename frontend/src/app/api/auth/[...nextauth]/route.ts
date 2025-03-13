import NextAuth from 'next-auth';
import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
// MetaMask-т зориулсан тусгай Provider байхгүй тул custom approach эсвэл credentials-like арга хэрэглэж болно

export const authOptions: AuthOptions = {
  session: {
    strategy: 'jwt',
  },
  providers: [
    // 1) Email/Password (Credentials) Provider
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        // Энд таны backend эсвэл DB рүү холбогдож хэрэглэгчийн email/password шалгана
        // Жишээ:
        const { email, password } = credentials as {
          email: string;
          password: string;
        };

        // Та энд өөрийн DB-ээс хэрэглэгчийг шалгаж болно
        if (email === 'test@example.com' && password === '123456') {
          return { id: '1', name: 'Test User', email: 'test@example.com' };
        }

        // Хэрэв буруу бол null буцаана
        return null;
      },
    }),

    // 2) Google Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    // 3) MetaMask - Custom approach
    // Үүнд signature-д суурилсан шалгалт хийх эсвэл Credentials provider-тэй төстэй байдлаар
    // 'wallet address' талбар авч authorize-д шалгах боломжтой.
  ],
  pages: {
    signIn: '/login', // login хуудсаа заана
  },
  callbacks: {
    // session эсвэл jwt колбэкуудыг хүссэнээрээ өөрчлөх боломжтой
    async jwt({ token, user, account }) {
      if (user) {
        token.user = user;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.user) {
        session.user = token.user as any;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
