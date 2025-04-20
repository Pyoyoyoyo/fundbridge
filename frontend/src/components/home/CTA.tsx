'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function CTA() {
  return (
    <section className='relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-400 text-white w-full'>
      <div className='px-4 py-16 text-center max-w-7xl mx-auto'>
        <motion.h2
          className='mb-4 text-2xl font-semibold sm:text-3xl'
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          Одоо эхлэхэд бэлэн үү?
        </motion.h2>
        <motion.p
          className='mx-auto max-w-2xl'
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          viewport={{ once: true }}
        >
          FundBridge платформ дээр төслөө үүсгэж, хөрөнгө оруулалт татаж
          эхлээрэй. Эсвэл бусад төслүүдтэй танилцан, дэмжлэг үзүүлэх боломжтой.
        </motion.p>
        <div className='mt-6 flex flex-wrap justify-center gap-4'>
          {/* “Төслөө эхлүүлэх” → /campaigns/create */}
          <Link href='/campaigns/create'>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className='rounded bg-white px-6 py-3 text-blue-600 hover:bg-gray-100'
            >
              Төслөө эхлүүлэх
            </motion.button>
          </Link>

          {/* “Төслүүд үзэх” → /campaigns */}
          <Link href='/campaigns'>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className='rounded border border-white px-6 py-3 text-white hover:bg-white hover:text-blue-600'
            >
              Төслүүд үзэх
            </motion.button>
          </Link>
        </div>
      </div>
    </section>
  );
}
