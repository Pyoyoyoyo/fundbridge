'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

// Та ethers эсвэл өөр library ашиглан Smart contract‐оос мэдээлэл татна гэе
// import { getSomeStats } from '@/services/statsService';

interface StatsProps {
  totalProjects: number;
  totalRaised: number; // Wei гэж үзье, дараа нь ETH эсвэл MNT болгон хөрвүүлнэ
  activeProjects: number;
}

export default function StatsSection() {
  const [stats, setStats] = useState<StatsProps>({
    totalProjects: 0,
    totalRaised: 0,
    activeProjects: 0,
  });

  // Та энд contract/service‐ээс мэдээлэл татах логикоо бичиж болно
  // Жишээ:
  useEffect(() => {
    async function fetchStats() {
      try {
        // const { totalProjects, totalRaised, activeProjects } = await getSomeStats();
        // setStats({ totalProjects, totalRaised, activeProjects });

        // Mock data:
        setStats({
          totalProjects: 128,
          totalRaised: 10_000_000_000_000_000_000, // Wei гэж үзье
          activeProjects: 32,
        });
      } catch (err) {
        console.error('Stats fetch error:', err);
      }
    }
    fetchStats();
  }, []);

  // totalRaised Wei → ETH
  const totalRaisedEth = parseFloat(
    // ethers.formatEther(BigInt(stats.totalRaised))
    // Хэрэв ethers ашиглаж байгаа бол иймэрхүү хэлбэрээр
    (stats.totalRaised / 1e18).toString() // жишээ
  );

  // Үзүүлэхдээ MNT болгож харуулах жишээ:
  const totalRaisedMnt = Math.floor(totalRaisedEth * 6_000_000);

  return (
    <section className='py-12 bg-gray-50 px-10'>
      <div className='container mx-auto px-4 text-center'>
        <motion.h2
          className='text-2xl font-bold text-gray-800 sm:text-3xl mb-8'
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
        >
          Төслийн статистик
        </motion.h2>
        <div className='grid gap-6 sm:grid-cols-3'>
          <motion.div
            className='rounded-lg bg-white p-6 shadow hover:shadow-md transition-shadow'
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            viewport={{ once: true }}
          >
            <p className='text-gray-600 mb-2'>Нийт төслүүд</p>
            <h3 className='text-3xl font-bold text-blue-600'>
              {stats.totalProjects}
            </h3>
          </motion.div>
          <motion.div
            className='rounded-lg bg-white p-6 shadow hover:shadow-md transition-shadow'
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <p className='text-gray-600 mb-2'>Цугласан нийт хөрөнгө</p>
            <h3 className='text-3xl font-bold text-blue-600'>
              {totalRaisedMnt.toLocaleString()} MNT
            </h3>
          </motion.div>
          <motion.div
            className='rounded-lg bg-white p-6 shadow hover:shadow-md transition-shadow'
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <p className='text-gray-600 mb-2'>Идэвхтэй төслүүд</p>
            <h3 className='text-3xl font-bold text-blue-600'>
              {stats.activeProjects}
            </h3>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
