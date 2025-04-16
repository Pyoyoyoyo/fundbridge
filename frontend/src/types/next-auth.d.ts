import NextAuth, { DefaultSession, DefaultUser } from 'next-auth';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      name: string; // Үнэн (non-nullable)
      email: string;
      kycOtpVerified: boolean;
      kycVerified: boolean; // Үнэн буюу boolean утга байх ёстой
      image?: string | null;
    };
  }

  interface User extends DefaultUser {
    id: string;
    name: string; // Үнэн (non-nullable)
    email: string;
    kycOtpVerified: boolean;
    kycVerified: boolean;
  }
}
