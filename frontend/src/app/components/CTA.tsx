// src/components/CTA.tsx
'use client';

export default function CTA() {
  return (
    <section className='container mx-auto px-4 py-16 text-center'>
      <h2 className='mb-4 text-2xl font-semibold text-gray-800 sm:text-3xl'>
        Одоо эхлэхэд бэлэн үү?
      </h2>
      <p className='mx-auto max-w-2xl text-gray-600'>
        FundBridge платформ дээр төслөө үүсгэж, хөрөнгө оруулалт татаж эхлээрэй.
        Эсвэл бусад төслүүдтэй танилцан, дэмжлэг үзүүлэх боломжтой.
      </p>
      <div className='mt-6 flex flex-wrap justify-center gap-4'>
        <button className='rounded bg-blue-600 px-6 py-3 text-white hover:bg-blue-500'>
          Төслөө эхлүүлэх
        </button>
        <button className='rounded border border-blue-600 px-6 py-3 text-blue-600 hover:bg-blue-50'>
          Төслүүд үзэх
        </button>
      </div>
    </section>
  );
}
