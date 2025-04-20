import './globals.css';
import Header from '@/components/SharedComponents/Header';
import { Metadata } from 'next';
import Providers from '@/providers/providers';

export const metadata: Metadata = {
  title: 'FundBridge',
  description: 'Decentralized fundraising platform',
  icons: {
    icon: '/white-logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body className='min-h-screen bg-gray-50'>
        <Providers>
          <Header />
          <main className='container mx-auto'>
            {/**
             * ТУХАЙН ROOT LAYOUT-Д @stripe/react-stripe-js ОРУУЛАХ ШААРДЛАГАГҮЙ
             * Хэрэв бүх child-д нэгэн зэрэг хэрэглэх бол энд StripeProvider-ээр ороож болно
             * Гэхдээ layout.tsx нь server component тул шууд import хийж болохгүй!
             */}
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
