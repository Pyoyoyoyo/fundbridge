'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { signIn } from 'next-auth/react';
import googleLogo from '@img/login/google-logo.png';
import walletLogo from '@img/login/wallet-logo.png';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false, // бид гараар redirect хийх тул false
    });

    setLoading(false);

    if (result?.error) {
      setError(result.error);
    } else {
      // Амжилттай нэвтэрсэн
      router.push('/');
    }
  }

  async function handleGoogleLogin() {
    // Google provider рүү чиглүүлэх
    await signIn('google', { callbackUrl: '/' });
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-100'>
      <Card className='w-full max-w-md bg-white shadow-lg rounded-lg p-8'>
        <CardHeader className='bg-blue-600 text-white p-5 rounded-t-lg shadow-md'>
          <CardTitle className='text-center text-xl font-bold'>
            Нэвтрэх
          </CardTitle>
        </CardHeader>
        <CardContent className='p-6 space-y-4'>
          {error && (
            <Alert
              variant='destructive'
              className='bg-red-600 text-white p-3 rounded-md'
            >
              <AlertTitle>Алдаа</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleLogin} className='space-y-4'>
            <Input
              id='email'
              type='email'
              placeholder='И-мэйл'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-md'
            />
            <Input
              id='password'
              type='password'
              placeholder='Нууц үг'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-md'
            />
            <Button
              type='submit'
              disabled={loading}
              className='w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-md shadow-md transition-all'
            >
              {loading ? 'Нэвтэрч байна...' : 'Нэвтрэх'}
            </Button>
          </form>
          <div className='text-center text-sm text-gray-700 mt-4'>
            <a href='#' className='text-blue-600 hover:underline'>
              Нууц үг сэргээх
            </a>
          </div>
          <div className='text-center text-sm text-gray-700 mt-2'>
            <span>Шинэ хэрэглэгч үү?</span>{' '}
            <a href='/signup' className='text-blue-600 hover:underline'>
              Бүртгүүлэх
            </a>
          </div>
          <div className='my-4 flex items-center'>
            <div className='flex-1 border-t border-gray-300' />
            <p className='mx-2 text-sm text-gray-500'>эсвэл</p>
            <div className='flex-1 border-t border-gray-300' />
          </div>
          <div className='flex flex-col space-y-2'>
            <Button
              variant='outline'
              className='flex items-center justify-center space-x-2 border border-gray-300 px-4 py-2 text-sm hover:bg-gray-100'
              onClick={handleGoogleLogin}
            >
              <Image src={googleLogo} alt='Google' className='h-4 w-4' />
              <span>Google-ээр нэвтрэх</span>
            </Button>
            <Button variant='outline'>
              <Image src={walletLogo} alt='Google' className='h-4 w-4' />
              <span>MetaMask Wallet-ээр нэвтрэх</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
