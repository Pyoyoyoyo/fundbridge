'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Бүртгэхэд алдаа гарлаа');
      }

      // Бүртгүүлсний дараа автоматаар login руу
      router.push('/login');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50'>
      <form
        onSubmit={handleSignup}
        className='bg-white p-8 rounded shadow max-w-md w-full space-y-4'
      >
        <h2 className='text-2xl font-bold text-center'>Бүртгүүлэх</h2>

        {error && (
          <Alert variant='destructive'>
            <AlertTitle>Алдаа</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Input
          placeholder='Нэр'
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          placeholder='И-мэйл'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          type='password'
          placeholder='Нууц үг'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button type='submit' className='w-full bg-blue-600 text-white'>
          {loading ? 'Бүртгэж байна...' : 'Бүртгүүлэх'}
        </Button>

        <p className='text-center text-sm text-gray-600'>
          Та бүртгэлтэй юу?{' '}
          <a href='/login' className='text-blue-600 hover:underline'>
            Нэвтрэх
          </a>
        </p>
      </form>
    </div>
  );
}
