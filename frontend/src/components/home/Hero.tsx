'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import heroImage from '@img/home/hero-image.jpg';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function Hero() {
  const router = useRouter();
  const { data: session } = useSession();

  function handleStartCampaign() {
    if (!session?.user?.kycVerified) {
      router.push('/kyc'); // ⛔️ Баталгаажаагүй бол KYC рүү
    } else {
      router.push('/campaigns/create'); // ✅ Баталгаажсан бол campaign эхлүүлэх рүү
    }
  }

  return (
    <section className='relative overflow-hidden bg-gradient-to-b from-blue-50 to-white w-full mx-auto'>
      <div className='flex flex-col-reverse items-center gap-8 px-8 py-16 md:flex-row md:py-24 max-w-7xl mx-auto'>
        {/* Зүүн талд: Текст */}
        <motion.div
          className='md:w-1/2'
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h1 className='text-3xl font-bold text-gray-800 sm:text-4xl lg:text-5xl'>
            Төслийн хөрөнгө босголтоо
            <br className='hidden sm:block' />
            <span className='text-blue-600'> FundBridge </span>
            -тэй хамт эхлүүл
          </h1>
          <p className='mt-4 text-gray-600'>
            FundBridge нь дэвшилтэт технологи дээр суурилсан, хөрөнгө оруулагчид
            болон стартапуудыг холбох crowdfunding болон хандивын платформ юм.
            Та төслөө хурдан, итгэлтэйгээр танилцуулж, дэлхий дахинаас хөрөнгө
            оруулалт авах боломжтой.
          </p>
          <div className='mt-6 flex flex-wrap gap-4 justify-center md:justify-start'>
            {/* ✅ KYC шалгалттай товч */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className='rounded bg-blue-600 px-6 py-3 text-white hover:bg-blue-500'
              onClick={handleStartCampaign}
            >
              Төслөө эхлүүлэх
            </motion.button>

            {/* Marketplace товч */}
            <motion.a
              href='/marketplace'
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className='rounded border border-blue-600 px-6 py-3 text-blue-600 hover:bg-blue-50'
            >
              Хөрөнгө оруулах
            </motion.a>
          </div>
        </motion.div>

        {/* Баруун талд: Hero Image */}
        <motion.div
          className='md:w-1/2'
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <Image
            src={heroImage}
            alt='FundBridge Hero'
            className='mx-auto w-full max-w-sm md:max-w-md'
            width={500}
            height={400}
            priority
          />
        </motion.div>
      </div>
    </section>
  );
}
