'use client';

import { motion } from 'framer-motion';
import { Megaphone } from 'lucide-react';
import Image from 'next/image';
import { Textarea } from '@/components/ui/textarea';

import promoIllustration from '@img/campaign/promotion-illustration.svg';

export default function PromotionStep({
  formData,
  updateFormData,
}: {
  formData: any;
  updateFormData: (fields: Partial<any>) => void;
}) {
  const promotionValue = formData?.promotion ?? '';

  function handleChange(newValue: string) {
    updateFormData({ promotion: newValue });
  }

  return (
    <motion.div
      className='flex flex-col gap-8 p-6 bg-white rounded shadow'
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
    >
      {/* Дээд талд иллюстрац, гарчиг, товч тайлбар */}
      <div className='flex flex-col items-center text-center space-y-4'>
        <Image
          src={promoIllustration}
          alt='Promotion illustration'
          width={760}
          height={100}
        />
        <div className='flex items-center gap-2 text-xl font-semibold text-blue-600'>
          <Megaphone className='w-6 h-6' />
          <span>Сурталчилгаа (Promotion)</span>
        </div>
        <p className='text-gray-600'>
          Маркетинг, олон нийтийн сүлжээ, сурталчилгаа хийх төлөвлөгөө...
        </p>
      </div>

      {/* Доод талд: Нэг баганатай форм */}
      <div className='flex flex-col space-y-2'>
        <label className='flex items-center gap-1 font-medium text-gray-700'>
          <Megaphone className='w-4 h-4 text-gray-500' />
          Сурталчилгаа / Маркетинг төлөвлөгөө
        </label>
        <Textarea
          placeholder='Маркетинг, олон нийтийн сүлжээ, сурталчилгаа...'
          value={promotionValue}
          onChange={(e) => handleChange(e.target.value)}
          className='h-32'
        />
      </div>
    </motion.div>
  );
}
