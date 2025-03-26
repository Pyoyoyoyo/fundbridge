'use client';

import { motion } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import paymentIllustration from '@img/campaign/payment-illustration.svg';

// Таны FormData, PaymentData интерфэйсүүд
import { FormData, PaymentData, PaymentCostItem } from '@/app/interfaces';

interface PaymentStepProps {
  formData: FormData; // бүх FormData ирнэ (basics, paymentInfo, г.м.)
  updateFormData: (data: Partial<FormData>) => void;
}

export default function PaymentStep({
  formData,
  updateFormData,
}: PaymentStepProps) {
  // paymentInfo-г авч, fallback өгнө
  const paymentData: PaymentData = formData.paymentInfo ?? {
    fundingCosts: [],
    fundbridgeFee: formData.basics.goal
      ? (parseFloat(formData.basics.goal) * 0.002).toFixed(2)
      : '',
    publishingFee: formData.basics.goal > '1000000' ? '50000' : '20000',
  };

  /**
   * Санхүүжилтийн задаргааны төлбөрийн мэдээллийг updateFormData руу дамжуулах
   */
  function handlePaymentChange(fields: Partial<PaymentData>) {
    updateFormData({
      paymentInfo: {
        ...paymentData,
        ...fields,
      },
    });
  }

  // Зардлын мөр нэмэх
  function addFundingCost() {
    const newCost: PaymentCostItem = {
      title: '',
      amount: '',
      currency: '₮',
      description: '',
    };
    handlePaymentChange({
      fundingCosts: [...paymentData.fundingCosts, newCost],
    });
  }

  // Зардлын мөр устгах
  function removeFundingCost(index: number) {
    const updated = [...paymentData.fundingCosts];
    updated.splice(index, 1);
    handlePaymentChange({ fundingCosts: updated });
  }

  // Зардлын мөрийн утгуудыг өөрчлөх
  function handleFundingCostChange(
    index: number,
    field: keyof PaymentCostItem,
    value: string
  ) {
    const updated = [...paymentData.fundingCosts];
    updated[index] = { ...updated[index], [field]: value };
    handlePaymentChange({ fundingCosts: updated });
  }

  return (
    <motion.div
      className='flex flex-col gap-8 p-6 bg-white rounded shadow'
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
    >
      <div className='flex flex-col items-center text-center space-y-4'>
        <Image
          src={paymentIllustration}
          alt='Payment illustration'
          width={760}
          height={100}
        />
        <h2 className='text-xl font-semibold text-blue-600'>
          Төлбөрийн мэдээлэл (Payment Info)
        </h2>
        <p className='text-gray-600'>
          Төслийн санхүүжилтийн задаргаа, шимтгэл болон нийтлэх төлбөрийн
          мэдээлэл
        </p>
      </div>

      <div className='flex flex-col space-y-6'>
        {/* 01. Санхүүжилтийн задаргаа */}
        <div className='space-y-4'>
          <div className='space-y-2'>
            <h3 className='text-lg font-semibold text-gray-800'>
              03. Санхүүжилтийн задаргаа
            </h3>
            <p className='text-sm text-gray-500'>
              Энэ хэсгийн мэдээлэл нь нийтэд ил харагдахгүй ба төслийн хүсэлтийг
              шалгахад ашиглагдана.
            </p>
          </div>

          {paymentData.fundingCosts.map((cost, index) => (
            <div
              key={index}
              className='border border-gray-200 rounded-md p-4 space-y-2 relative'
            >
              <button
                type='button'
                className='absolute top-2 right-2 text-gray-400 hover:text-red-500'
                onClick={() => removeFundingCost(index)}
              >
                <Trash2 className='w-4 h-4' />
              </button>

              <Input
                placeholder='Зардлын нэр (Жишээ: Тоног төхөөрөмж)'
                value={cost.title}
                onChange={(e) =>
                  handleFundingCostChange(index, 'title', e.target.value)
                }
              />

              <div className='flex gap-2'>
                <Input
                  placeholder='Дүн (Жишээ: 20000000.00)'
                  value={cost.amount}
                  onChange={(e) =>
                    handleFundingCostChange(index, 'amount', e.target.value)
                  }
                />
                <Input
                  placeholder='Валют (Жишээ: ₮)'
                  value={cost.currency}
                  onChange={(e) =>
                    handleFundingCostChange(index, 'currency', e.target.value)
                  }
                  className='w-20'
                />
              </div>

              <Textarea
                placeholder='Тайлбар (Жишээ: Гурван төрлийн кофе машин оруулж ирэх)'
                value={cost.description}
                onChange={(e) =>
                  handleFundingCostChange(index, 'description', e.target.value)
                }
                className='h-20'
              />
            </div>
          ))}

          <Button variant='outline' onClick={addFundingCost}>
            <Plus className='w-4 h-4 mr-1' />
            Зардлын мөр нэмэх
          </Button>
        </div>

        {/* 02. Шимтгэл, төлбөр */}
        <div className='space-y-4'>
          <h3 className='text-lg font-semibold text-gray-800'>
            04. Шимтгэл, төлбөр
          </h3>

          {/* Нийт босгох мөнгөн дүн -> formData.basics.goal */}
          <div className='space-y-2'>
            <label className='text-gray-700 font-medium'>
              Нийт босгох мөнгөн дүн
            </label>
            <Input placeholder='0' value={formData.basics.goal} readOnly />
          </div>

          {/* Fundbridge шимтгэл (goal-ийн 0.002%) */}
          <div className='space-y-2'>
            <label className='text-gray-700 font-medium'>
              Fundbridge шимтгэл (2.00%)
            </label>
            <Input
              placeholder='-'
              value={paymentData.fundbridgeFee}
              onChange={(e) =>
                handlePaymentChange({ fundbridgeFee: e.target.value })
              }
            />
            <p className='text-xs text-gray-500'>
              * Үйлчилгээний шимтгэлийг эцсийн босгосон санхүүжилтээс суутган
              авна.
            </p>
          </div>

          {/* Төсөл нийтлэх төлбөр (50000) */}
          <div className='space-y-2'>
            <label className='text-gray-700 font-medium'>
              Төсөл нийтлэх төлбөр (хоног)
            </label>
            <Input
              placeholder='0'
              value={paymentData.publishingFee}
              onChange={(e) =>
                handlePaymentChange({ publishingFee: e.target.value })
              }
            />
            <p className='text-xs text-gray-500'>
              * Нийтлэх төлбөр төлөгдсөний дараа төслийг нийтлэх боломжтой.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
