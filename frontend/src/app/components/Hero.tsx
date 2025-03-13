// src/components/Hero.tsx
'use client';

import { Link } from 'lucide-react';

export default function Hero() {
  return (
    <section className='relative overflow-hidden bg-gray-50'>
      <div className='container mx-auto flex flex-col-reverse items-center gap-8 px-4 py-16 md:flex-row md:py-24'>
        {/* Зүүн талд: Тайлбар текст */}
        <div className='md:w-1/2'>
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
            <button className='rounded bg-blue-600 px-6 py-3 text-white hover:bg-blue-500'>
              Эхлүүлэх
            </button>
            <button className='rounded border border-blue-600 px-6 py-3 text-blue-600 hover:bg-blue-50'>
              Хөрөнгө оруулагчид
            </button>
          </div>
        </div>

        {/* Баруун талд: Зураг (hero image) */}
        <div className='md:w-1/2'>
          <img
            src='/hero-image.jpg'
            alt='FundBridge Hero'
            className='mx-auto w-full max-w-sm md:max-w-md'
          />
        </div>
      </div>
    </section>
  );
}
