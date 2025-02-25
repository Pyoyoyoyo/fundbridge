// src/app/layout.tsx
import './globals.css';
import Header from '../components/ui/Header';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FundBridge',
  description: 'Decentralized fundraising platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body className='min-h-screen bg-gray-50'>
        <Header />
        <main className='container mx-auto py-8'>{children}</main>
      </body>
    </html>
  );
}
