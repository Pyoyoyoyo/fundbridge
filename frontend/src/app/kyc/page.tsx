'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';

/**
 * KycGate компонент:
 * - Хэрэглэгч KYC үйл явцыг эхлүүлэх боломжтой.
 * - Том зургийн гэрээ, алхамуудын тайлбар бүхий дизайн бүхий.
 * - API дуугдаж амжилттай бол хэрэглэгчийг KYC провайдерийн (hostedUrl) хуудас рүү redirect хийнэ.
 */
export default function KycGate() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleStartKyc() {
    try {
      setLoading(true);
      setError(null);

      // Хэрэглэгчийн ID-г session эсвэл localStorage-аас аваарай.
      // Энэ жишээн дээр 'userId' утгыг localStorage-аас авч байгаа ба хэрэв олдоогүй бол "defaultUserId" гэж тохируулна.
      const userId = window.localStorage.getItem('userId') || 'defaultUserId';

      // API endpoint-д POST хүсэлт илгээж, KYC verification session үүсгэнэ.
      const res = await fetch('/api/kyc/create-verification-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(
          errData.error || 'Failed to create verification session'
        );
      }

      const data = await res.json();
      if (!data.hostedUrl) {
        throw new Error('No hostedUrl returned from server');
      }

      // Хэрэглэгчийг KYC үйл явцыг эхлэх хуудас руу (жишээ нь, Stripe Identity эсвэл өөр KYC провайдерийн хуудас) redirect хийнэ.
      window.location.href = data.hostedUrl;
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='max-w-4xl mx-auto mt-16 p-8 bg-white rounded-lg shadow-lg'>
      {/* Том, диаграмтай KYC-ийн зураг */}
      {/* <div className='relative w-full h-64 mb-8'>
        <Image
          src='/images/kyc-diagram.png' // Өөрийн зурагны замыг тохируулна (жишээ: public/images/kyc-diagram.png)
          alt='KYC Диаграмм'
          fill
          className='object-contain'
        />
      </div> */}

      <h2 className='text-2xl font-bold text-blue-600 text-center mb-4'>
        KYC Баталгаажуулалт
      </h2>

      <p className='text-lg text-gray-700 text-center mb-6'>
        Та платформын үйлдэл эхлэхээс өмнө өөрийн бүртгэгдсэн иргэний мэдээллээ
        баталгаажуулах шаардлагатай. Манай KYC систем нь дараах алхамуудыг
        дагаж, мэдээллийг найдвартай, криптографийн баталгаажуулалтаар
        хамгаална:
      </p>

      <ul className='list-decimal list-inside text-gray-600 text-lg mb-6 space-y-2'>
        <li>
          <span className='font-semibold'>Иргэний мэдээлэл цуглуулах:</span>{' '}
          Танилцуулга ба хувийн мэдээллийг эхлээд баталгаажуулах.
        </li>
        <li>
          <span className='font-semibold'>Криптографийн баталгаажуулалт:</span>{' '}
          Өгөгдлийг нууцалж, дэвшилтэт криптографийн аргачлалыг ашиглан
          баталгаажуулах.
        </li>
        <li>
          <span className='font-semibold'>
            Нэг удаагийн код эсвэл тоон гарын үсэг:
          </span>{' '}
          Нэвтрэлтийн нэг удаагийн код эсвэл тоон гарын үсэгээр баталгаажуулалт
          хийх.
        </li>
      </ul>

      {/* Алдаа мэдэгдэл */}
      <AnimatePresence>
        {error && (
          <motion.div
            key='error-alert'
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
          >
            <Alert
              variant='destructive'
              className='bg-red-100 text-red-800 mb-4'
            >
              <div className='flex items-center gap-2'>
                <AlertCircle className='w-5 h-5' />
                <AlertTitle>Алдаа</AlertTitle>
              </div>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* KYC эхлүүлэх товч */}
      <div className='flex justify-center'>
        <Button
          onClick={handleStartKyc}
          disabled={loading}
          className='bg-blue-600 hover:bg-blue-500 text-white py-3 px-6 rounded-lg text-lg'
        >
          {loading ? 'KYC үйл явц эхлүүлж байна...' : 'KYC эхлүүлэх'}
        </Button>
      </div>

      {/* Loading overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div
            className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className='bg-white rounded p-8 shadow flex items-center gap-4'
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <Loader2 className='w-8 h-8 animate-spin text-blue-600' />
              <div>
                <AlertTitle className='text-blue-600 text-xl'>
                  Илгээж байна...
                </AlertTitle>
                <AlertDescription className='text-gray-600'>
                  Та түр хүлээнэ үү.
                </AlertDescription>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
