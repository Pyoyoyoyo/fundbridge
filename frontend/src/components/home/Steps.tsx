'use client';

import { motion } from 'framer-motion';
import { FilePlus, Coins, CheckCircle2 } from 'lucide-react';

export default function Steps() {
  const steps = [
    {
      title: '1. Төслөө үүсгэх',
      description:
        'Төслийн нэр, зорилго, хугацаа, санхүүжилтийн дүнгээ оруулаад, шууд эхлүүл.',
      icon: <FilePlus className='w-6 h-6 text-blue-600' />,
    },
    {
      title: '2. Хандив, хөрөнгө оруулалт авах',
      description:
        'Крипто болон FIAT хэлбэрээр дэлхийн хаанаас ч хөрөнгө босгож, орлогоо хяна.',
      icon: <Coins className='w-6 h-6 text-blue-600' />,
    },
    {
      title: '3. Мөнгөө зарцуулах, тайлагнах',
      description:
        'Зорилгодоо хүрмэгц төслөө хаах эсвэл үргэлжлүүлэн хөрөнгө татах. Блокчэйн дээр бүх гүйлгээ ил тод хадгалагдана.',
      icon: <CheckCircle2 className='w-6 h-6 text-blue-600' />,
    },
  ];

  return (
    <section className='w-full bg-gray-50'>
      <div className='container mx-auto py-12 px-10'>
        <motion.h2
          className='mb-4 text-2xl font-semibold text-gray-800 sm:text-3xl'
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
        >
          FundBridge хэрхэн ажилладаг вэ?
        </motion.h2>
        <div className='grid gap-8 sm:grid-cols-2 lg:grid-cols-3'>
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              className='rounded-lg bg-white p-6 shadow-sm hover:shadow-md transition-shadow'
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <div className='mb-2 flex items-center gap-2'>
                {step.icon}
                <h3 className='text-lg font-medium text-gray-800'>
                  {step.title}
                </h3>
              </div>
              <p className='text-gray-600'>{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
