'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Хэрэв нэвтрээгүй бол шууд login руу
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <p className='text-gray-500'>Loading...</p>
      </div>
    );
  }

  // Хэрэв session байхгүй бол түр хоосон байдал
  if (!session?.user) {
    return null; // эсвэл <p>Redirecting...</p>
  }

  // Session байгаа тохиолдолд user-ийн мэдээлэл харуулна
  const { user } = session;

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='mx-auto max-w-md rounded bg-white p-6 shadow'>
        <h1 className='mb-4 text-2xl font-bold text-gray-800'>Миний профайл</h1>
        <div className='flex items-center space-x-4'>
          <img
            src={user.image || '/default-avatar.png'}
            alt='Profile'
            className='h-16 w-16 rounded-full object-cover'
          />
          <div>
            <h2 className='text-lg font-semibold text-gray-800'>
              {user.name || 'No Name'}
            </h2>
            <p className='text-sm text-gray-600'>{user.email || 'No Email'}</p>
          </div>
        </div>

        <div className='mt-6 space-y-2'>
          <div className='flex justify-between'>
            <span className='font-medium text-gray-700'>Нэр:</span>
            <span className='text-gray-800'>{user.name || '—'}</span>
          </div>
          <div className='flex justify-between'>
            <span className='font-medium text-gray-700'>И-мэйл:</span>
            <span className='text-gray-800'>{user.email || '—'}</span>
          </div>
          {/* Та нэмэлт мэдээлэл оруулах бол эндээ бичиж болно */}
        </div>
      </div>
    </div>
  );
}
