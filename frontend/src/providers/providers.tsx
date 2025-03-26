'use client';

import { SessionProvider } from 'next-auth/react';
import StripeProvider from './StripeProvider';
import React from 'react';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <StripeProvider>{children} </StripeProvider>
    </SessionProvider>
  );
}
