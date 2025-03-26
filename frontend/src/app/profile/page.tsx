'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Хэрэглэгчийн session мэдээллийг харуулах жишээ.
 */
export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Хэрэглэгч нэвтрээгүй бол login руу чиглүүлэх жишээ
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className='p-4'>
        <Skeleton className='h-8 w-1/2 mb-2' />
        <Skeleton className='h-6 w-1/3' />
      </div>
    );
  }

  if (!session?.user) {
    return <p className='p-4 text-red-500'>User not found or not logged in.</p>;
  }

  // session.user дотор name, email, image гэх мэт талбарууд байдаг (NextAuth)
  const { user } = session;

  return (
    <div className='max-w-2xl mx-auto p-4 space-y-4'>
      <h1 className='text-2xl font-bold text-gray-800'>Profile</h1>
      <div className='flex items-center gap-4'>
        <img
          src={user.image || '/default-avatar.png'}
          alt='Avatar'
          className='w-16 h-16 rounded-full object-cover'
        />
        <div>
          <p className='text-lg font-semibold text-gray-700'>
            {user.name || 'No name'}
          </p>
          <p className='text-sm text-gray-600'>{user.email}</p>
        </div>
      </div>

      <p className='text-gray-600 mt-4'>
        Та өөрийн мэдээллийг энд харах буюу өөрчилж болно.
      </p>

      {/* Жишээ: Profile‐ээ засах товч */}
      <button className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500'>
        Edit Profile
      </button>
    </div>
  );
}
