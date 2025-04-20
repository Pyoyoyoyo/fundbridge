'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface SocialProofStats {
  totalUsers: number;
  successRate: number; // %
  totalInvestment: number; // wei
}

export default function SocialProofSection() {
  const [stats, setStats] = useState<SocialProofStats>({
    totalUsers: 0,
    successRate: 0,
    totalInvestment: 0,
  });

  useEffect(() => {
    async function fetchSocialProof() {
      // contract/service‐ээс мэдээлэл татах
      // Mock data:
      setStats({
        totalUsers: 4350,
        successRate: 78, // %
        totalInvestment: 2_500_000_000_000_000_000, // wei
      });
    }
    fetchSocialProof();
  }, []);

  const totalInvestmentEth = parseFloat(
    (stats.totalInvestment / 1e18).toString()
  );
  const totalInvestmentMnt = Math.floor(totalInvestmentEth * 6_000_000);

  return (
    <section className='py-12 bg-white w-full px-4'>
      <div className='container mx-auto px-4'>
        <motion.h2
          className='mb-6 text-2xl font-semibold text-gray-800 sm:text-3xl text-center'
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
        >
          Хэрэглэгчдийн итгэл
        </motion.h2>
        <div className='grid gap-6 sm:grid-cols-3 text-center'>
          <motion.div
            className='rounded-lg border p-6 shadow-sm hover:shadow-md transition-shadow'
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            viewport={{ once: true }}
          >
            <p className='text-gray-600 mb-2'>Нийт хэрэглэгчид</p>
            <h3 className='text-3xl font-bold text-blue-600'>
              {stats.totalUsers.toLocaleString()}
            </h3>
          </motion.div>
          <motion.div
            className='rounded-lg border p-6 shadow-sm hover:shadow-md transition-shadow'
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <p className='text-gray-600 mb-2'>
              Амжилттай дууссан төслүүдийн хувь
            </p>
            <h3 className='text-3xl font-bold text-blue-600'>
              {stats.successRate}%
            </h3>
          </motion.div>
          <motion.div
            className='rounded-lg border p-6 shadow-sm hover:shadow-md transition-shadow'
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <p className='text-gray-600 mb-2'>Нийт хөрөнгө оруулалт</p>
            <h3 className='text-3xl font-bold text-blue-600'>
              {totalInvestmentMnt.toLocaleString()} MNT
            </h3>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
