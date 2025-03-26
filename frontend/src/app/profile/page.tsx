'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { BrowserProvider, ethers } from 'ethers';
import { Button } from '@/components/ui/button';

export default function ProfilePage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!session?.user) {
    return <p>Та нэвтэрч орно уу.</p>;
  }

  return (
    <div className='max-w-md mx-auto p-4'>
      <h1 className='text-2xl font-bold mb-4'>Таны профайл</h1>
      {error && <p className='text-red-500'>{error}</p>}

      {loading ? (
        <p>PoH‐д бүртгэлтэй эсэхийг шалгаж байна...</p>
      ) : registered === null ? (
        <p>MetaMask байхгүй эсвэл session алга.</p>
      ) : registered ? (
        <p className='text-green-600'>Та PoH дээр бүртгэлтэй байна!</p>
      ) : (
        <div>
          <p className='text-yellow-600 mb-2'>
            Та PoH дээр бүртгэлгүй байна. “Verify with PoH” товчийг дарж албан
            ёсны сайт руу ороод бүртгүүлнэ үү.
          </p>
        </div>
      )}
    </div>
  );
}
