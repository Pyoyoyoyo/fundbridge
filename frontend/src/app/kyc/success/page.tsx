'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function KycSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    async function markVerified() {
      try {
        await fetch('/api/kyc/mark-verified', {
          method: 'POST',
        });
      } catch (err) {
        console.error(
          'KYC баталгаажсан хэрэглэгчийг хадгалахад алдаа гарлаа:',
          err
        );
      }
    }

    markVerified(); // 🔹 DB-д KYC verified = true болгоно

    const timer = setTimeout(() => {
      router.push('/campaigns/create');
    }, 3000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className='min-h-screen flex flex-col items-center justify-center bg-gray-50 p-8'>
      <h1 className='text-3xl font-bold text-blue-600 mb-4'>
        KYC амжилттай баталгаажлаа!
      </h1>
      <p className='text-lg text-gray-700'>
        Та удахгүй кампанит ажил үүсгэх хуудсанд шилжүүлэх болно...
      </p>
      {/* Хэрэв хүсвэл доорх товчийг дарж шууд шилжүүлж болно */}
      <button
        className='mt-6 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-500'
        onClick={() => router.push('/campaigns/create')}
      >
        Шууд шилжүүлэх
      </button>
    </div>
  );
}
