// src/components/Hero.tsx
'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import heroImage from '@img/home/hero-image.jpg';

// Жишээ нэмэлт: SVG иллюстрац (public/images/hero-bg.svg) байрлуулж болно
// import heroBg from '@/public/images/hero-bg.svg';

export default function Hero() {
  return (
    <section className='relative overflow-hidden bg-gradient-to-b from-blue-50 to-white'>
      {/* 
        Хэрэв хүсвэл SVG background, эсвэл Lottie animation нэмж болно
        Жишээ нь: <Image src={heroBg} alt="Hero BG" className="absolute top-0 left-0 w-full h-auto opacity-50" />
      */}
      <div className='container mx-auto flex flex-col-reverse items-center gap-8 px-4 py-16 md:flex-row md:py-24'>
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
            болон стартапуудыг холбох краудфандинг платформ юм. Та төслөө
            хурдан, итгэлтэйгээр танилцуулж, дэлхий дахинаас хөрөнгө оруулалт
            авах боломжтой.
          </p>
          <div className='mt-6 flex flex-wrap gap-4'>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className='rounded bg-blue-600 px-6 py-3 text-white hover:bg-blue-500'
            >
              Эхлүүлэх
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className='rounded border border-blue-600 px-6 py-3 text-blue-600 hover:bg-blue-50'
            >
              Хөрөнгө оруулагчид
            </motion.button>
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
