'use client';

import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Globe2,
  Store,
  CreditCard,
  Star,
  Rocket,
} from 'lucide-react'; // Жишээ icon-ууд

export default function Advantages() {
  const items = [
    {
      title: 'Ил тод, найдвартай',
      description:
        'Бүх гүйлгээг блокчэйн дээр бүртгэснээр, санхүүгийн мэдээлэл өөрчлөгдөшгүй, ил тод байна.',
      icon: <ShieldCheck className='w-6 h-6 text-blue-600' />,
    },
    {
      title: 'Дэлхий нийтийн хамрах хүрээ',
      description:
        'Хөрөнгө оруулагчдыг улс орноор хязгаарлахгүй, дэлхийн өнцөг булан бүрээс дэмжлэг авах боломжтой.',
      icon: <Globe2 className='w-6 h-6 text-blue-600' />,
    },
    {
      title: 'Нэгдсэн Маркет',
      description:
        'Өөрийн үнэт зүйлсээ худалдаалж, орлогоо шууд төслийн санхүүжилтад хандивлах боломжтой.',
      icon: <Store className='w-6 h-6 text-blue-600' />,
    },
    {
      title: 'Олон төрлийн төлбөр',
      description:
        'Крипто (ETH) болон FIAT (карт, банк) ашиглан хөрөнгө оруулалт хийх уян хатан байдал.',
      icon: <CreditCard className='w-6 h-6 text-blue-600' />,
    },
    {
      title: 'Итгэлийн онооны систем',
      description:
        'Төслийн ашиглалт, тайланг ил тод тайлагнаснаар итгэлийн оноо нэмэгдүүлнэ.',
      icon: <Star className='w-6 h-6 text-blue-600' />,
    },
    {
      title: 'Энгийн эхлэлт',
      description:
        'Төслөө богино хугацаанд үүсгэж, зорилго, хугацаагаа тодорхойлон хөрөнгө босгож эхлэх боломжтой.',
      icon: <Rocket className='w-6 h-6 text-blue-600' />,
    },
  ];

  return (
    <section className='container mx-auto px-4 py-12'>
      <motion.h2
        className='mb-6 text-2xl font-semibold text-gray-800 sm:text-3xl'
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        viewport={{ once: true }}
      >
        FundBridge-ийн давуу талууд
      </motion.h2>
      <div className='grid gap-8 sm:grid-cols-2 lg:grid-cols-3'>
        {items.map((item, index) => (
          <motion.div
            key={item.title}
            className='rounded-lg border p-6 shadow-sm hover:shadow-md transition-shadow bg-white'
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            viewport={{ once: true }}
          >
            <div className='mb-2 flex items-center gap-2'>
              {item.icon}
              <h3 className='text-lg font-medium text-gray-800'>
                {item.title}
              </h3>
            </div>
            <p className='text-gray-600'>{item.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
