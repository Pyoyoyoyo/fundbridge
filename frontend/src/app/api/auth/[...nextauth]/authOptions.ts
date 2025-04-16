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

        const dbUser = await User.findOne({ email: credentials?.email });
        if (!dbUser) {
          console.log('❌ хэрэглэгч олдсонгүй');
          return null;
        }

        console.log('✅ хэрэглэгч олдлоо:', dbUser);

        const isValid = await compare(credentials!.password, dbUser.password);
        console.log('🔍 Нууц үг таарав уу?', isValid);

        if (!isValid) return null;

        return {
          id: dbUser._id.toString(), // 🛠 `dbUser` дээр _id байгаа
          name: dbUser.name,
          email: dbUser.email,
          kycVerified: dbUser.kycVerified,
          kycOtpVerified: dbUser.kycOtpVerified ?? false, // Ensure kycOtpVerified is included
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
          id: (user as any).id, // ← TypeScript-д алдаа өгөхгүйн тулд any
          email: user.email,
          name: user.name,
          kycVerified: (user as any).kycVerified ?? false,
        };
      }
      return token;
    },

    async session({ session, token }) {
      if (token.user && session.user) {
        session.user.id = (token.user as any).id;
        session.user.kycVerified = (token.user as any).kycVerified ?? false;
      }
      // 🔁 Хэрэглэгчийн KYC статусыг DB-с дахин шалгах
      await dbConnect();
      const dbUser = await User.findOne({ _id: (token.user as any).id });
      session.user.kycVerified = dbUser?.kycVerified ?? false;
      session.user.kycOtpVerified = dbUser?.kycOtpVerified ?? false;
      return session;
    },
  },
};
