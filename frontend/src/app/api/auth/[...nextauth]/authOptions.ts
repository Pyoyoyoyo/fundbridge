// ✅ app/api/auth/[...nextauth]/authOptions.ts
import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import User from '@/models/User';
import dbConnect from '@/lib/db';
import { compare } from 'bcryptjs';

export const authOptions: AuthOptions = {
  session: { strategy: 'jwt' },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        await dbConnect();

        console.log('🧪 authorize → credentials:', credentials);

        const user = await User.findOne({ email: credentials?.email });
        if (!user) {
          console.log('❌ хэрэглэгч олдсонгүй');
          return null;
        }

        console.log('✅ хэрэглэгч олдлоо:', user);

        const isValid = await compare(credentials!.password, user.password);
        console.log('🔍 Нууц үг таарав уу?', isValid);

        if (!isValid) return null;

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          kycVerified: user.kycVerified,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.user = {
          ...user,
          kycVerified: user.kycVerified ?? false,
        };
      }
      return token;
    },
    async session({ session, token }) {
      if (token.user && session.user?.email) {
        await dbConnect();
        const dbUser = await User.findOne({ email: session.user.email });
        session.user = {
          ...session.user,
          kycVerified: dbUser?.kycVerified ?? false,
        };
      }
      return session;
    },
  },
};
