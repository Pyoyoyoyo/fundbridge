'use client';

import { Textarea } from '@/components/ui/textarea';

export default function PromotionStep({
  formData,
  updateFormData,
}: {
  formData: any;
  updateFormData: (fields: Partial<any>) => void;
}) {
  // formData.promotion байхгүй бол (undefined) хоосон мөрөөр fallback
  const promotionValue = formData?.promotion ?? '';

  function handleChange(newValue: string) {
    updateFormData({ promotion: newValue });
  }

  return (
    <div className='space-y-4 bg-white p-6 rounded shadow'>
      <h2 className='text-xl font-semibold text-gray-800'>6. Promotion</h2>
      <p className='text-gray-600'>
        Кампанит ажлынхаа маркетинг, сурталчилгаа, олон нийтийн сүлжээ,
        сурталчилгаа хийх төлөвлөгөө гэх мэт мэдээллийг оруулна уу.
      </p>
      <Textarea
        placeholder='Маркетинг, олон нийтийн сүлжээ, сурталчилгаа...'
        value={promotionValue} // Энд заавал string дамжуулж байгаа
        onChange={(e) => handleChange(e.target.value)}
        className='h-32'
      />
    </div>
  );
}
