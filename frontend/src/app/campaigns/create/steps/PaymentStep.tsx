'use client';

import { motion } from 'framer-motion';
import { Building2, Coins, CreditCard } from 'lucide-react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';

// Жишээ зураг (public/images/payment-illustration.svg)
import paymentIllustration from '@img/campaign/payment-illustration.svg';

interface PaymentData {
  bankInfo: string;
  cryptoWallet: string;
}

interface PaymentStepProps {
  formData: {
    paymentInfo: PaymentData;
  };
  updateFormData: (data: { paymentInfo: PaymentData }) => void;
}

export default function PaymentStep({
  formData,
  updateFormData,
}: PaymentStepProps) {
  const paymentData = formData.paymentInfo ?? {
    bankInfo: '',
    cryptoWallet: '',
  };

  function handleChange(fields: Partial<PaymentData>) {
    updateFormData({
      paymentInfo: {
        ...paymentData,
        ...fields,
      },
    });
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
          src={paymentIllustration}
          alt='Payment illustration'
          width={760}
          height={100}
        />
        <div className='flex items-center gap-2 text-xl font-semibold text-blue-600'>
          <CreditCard className='w-6 h-6' />
          <span>Төлбөрийн мэдээлэл (Payment Info)</span>
        </div>
        <p className='text-gray-600'>
          Та банкны данс, crypto wallet зэрэг санхүүгийн мэдээллээ оруулна уу.
        </p>
      </div>

      {/* Доод талд: Нэг баганатай форм */}
      <div className='flex flex-col space-y-6'>
        {/* Банкны данс */}
        <div className='space-y-2'>
          <label className='flex items-center gap-1 font-medium text-gray-700'>
            <Building2 className='w-4 h-4 text-gray-500' />
            Банкны данс
          </label>
          <Input
            placeholder='Банкны данс'
            value={paymentData.bankInfo}
            onChange={(e) => handleChange({ bankInfo: e.target.value })}
          />
        </div>

        {/* Crypto Wallet */}
        <div className='space-y-2'>
          <label className='flex items-center gap-1 font-medium text-gray-700'>
            <Coins className='w-4 h-4 text-gray-500' />
            Crypto Wallet
          </label>
          <Input
            placeholder='Crypto wallet'
            value={paymentData.cryptoWallet}
            onChange={(e) => handleChange({ cryptoWallet: e.target.value })}
          />
        </div>
      </div>
    </motion.div>
  );
}
