'use client';

import { Input } from '@/components/ui/input';

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
  // paymentInfo байхгүй тохиолдолд (undefined) fallback
  const paymentData = formData.paymentInfo ?? {
    bankInfo: '',
    cryptoWallet: '',
  };

  // bankInfo, cryptoWallet-ыг controlled хэлбэрээр авах
  const bankValue = paymentData.bankInfo ?? '';
  const walletValue = paymentData.cryptoWallet ?? '';

  function handleChange(fields: Partial<PaymentData>) {
    updateFormData({
      paymentInfo: {
        ...paymentData,
        ...fields,
      },
    });
  }

  return (
    <div className='space-y-4 bg-white p-6 rounded shadow'>
      <h2 className='text-xl font-semibold text-gray-800'>
        Төлбөрийн мэдээлэл (Payment Info)
      </h2>

      <label className='block text-sm font-medium text-gray-700'>
        Банкны данс
      </label>
      <Input
        placeholder='Банкны данс'
        value={bankValue}
        onChange={(e) => handleChange({ bankInfo: e.target.value })}
      />

      <label className='block mt-4 text-sm font-medium text-gray-700'>
        Crypto Wallet
      </label>
      <Input
        placeholder='Crypto wallet'
        value={walletValue}
        onChange={(e) => handleChange({ cryptoWallet: e.target.value })}
      />
    </div>
  );
}
