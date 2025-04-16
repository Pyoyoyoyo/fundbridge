'use client';

import { motion } from 'framer-motion';
import { User } from 'lucide-react';

export default function Testimonials() {
  const data = [
    {
      name: 'Бат',
      feedback:
        'FundBridge-ийн ачаар маш хурдан хугацаанд хөрөнгө оруулалт татаж чадсан.',
      job: 'Стартап үүсгэн байгуулагч',
    },
    {
      name: 'Сараа',
      feedback:
        'Крипто болон FIAT төлбөрийн аль алиныг нь дэмждэг нь үнэхээр амар байлаа.',
      job: 'Төслийн менежер',
    },
    {
      name: 'Ганаа',
      feedback: 'Итгэлийн онооны систем нь бусад платформуудаас ялгарч байна.',
      job: 'Хөрөнгө оруулагч',
    },
  ];

  return (
    <section className='bg-white'>
      <div className='container mx-auto py-12 px-10'>
        <motion.h2
          className='mb-6 text-2xl font-semibold text-gray-800 sm:text-3xl'
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
        >
          Хэрэглэгчдийн сэтгэгдэл
        </motion.h2>
        <div className='grid gap-8 sm:grid-cols-2 lg:grid-cols-3'>
          {data.map((item, i) => (
            <motion.div
              key={i}
              className='rounded-lg border p-6 shadow-sm hover:shadow-md transition-shadow'
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <div className='mb-2 flex items-center gap-2'>
                <User className='w-6 h-6 text-blue-600' />
                <h3 className='text-lg font-medium text-gray-800'>
                  {item.name}
                </h3>
              </div>
              <p className='text-sm text-gray-500 mb-1 italic'>{item.job}</p>
              <p className='text-gray-600'>“{item.feedback}”</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
