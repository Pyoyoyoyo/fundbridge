'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { BadgeCheck, ShieldX } from 'lucide-react';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
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

  const { user } = session;

  return (
    <div className='max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg'>
      <div className='flex items-center gap-4 mb-6'>
        <img
          src={user.image || '/default-avatar.png'}
          alt='Avatar'
          className='w-20 h-20 rounded-full object-cover border border-gray-200'
        />
        <div>
          <h1 className='text-2xl font-bold text-gray-800'>{user.name}</h1>
          <p className='text-gray-600'>{user.email}</p>

          {/* ✅ KYC статус */}
          <div className='mt-2'>
            {user.kycVerified ? (
              <div className='flex items-center gap-1 text-green-600 font-semibold'>
                <BadgeCheck className='w-4 h-4' />
                KYC баталгаажсан
              </div>
            ) : (
              <div className='flex items-center gap-1 text-yellow-600 font-semibold'>
                <ShieldX className='w-4 h-4' />
                KYC баталгаажаагүй
              </div>
            )}
          </div>
        </div>
      </div>

      <p className='text-gray-700 mb-6'>
        Та өөрийн мэдээллийг шалгах, засварлах, эсвэл KYC баталгаажуулалт хийх
        боломжтой.
      </p>

      <div className='flex gap-3'>
        <Button
          className='bg-blue-600 hover:bg-blue-500 text-white'
          onClick={() => router.push('/profile/edit')}
        >
          Profile засах
        </Button>

        {!user.kycVerified && (
          <Button
            className='bg-yellow-500 hover:bg-yellow-400 text-white'
            onClick={() => router.push('/kyc')}
          >
            KYC баталгаажуулах
          </Button>
        )}
      </div>
    </div>
  );
}
