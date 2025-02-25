// src/components/Steps.tsx
'use client';

export default function Steps() {
  const steps = [
    {
      title: '1. Төслөө үүсгэх',
      description:
        'Төслийн нэр, зорилго, хугацаа, санхүүжилтийн дүнгээ оруулаад, шууд эхлүүл.',
    },
    {
      title: '2. Хандив, хөрөнгө оруулалт авах',
      description:
        'Крипто болон FIAT хэлбэрээр дэлхийн хаанаас ч хөрөнгө босгож, орлогоо хяна.',
    },
    {
      title: '3. Мөнгөө зарцуулах, тайлагнах',
      description:
        'Зорилгодоо хүрмэгц төслөө хаах эсвэл үргэлжлүүлэн хөрөнгө татах. Блокчэйн дээр бүх гүйлгээ ил тод хадгалагдана.',
    },
  ];

  return (
    <section className='bg-gray-50'>
      <div className='container mx-auto px-4 py-12'>
        <h2 className='mb-4 text-2xl font-semibold text-gray-800 sm:text-3xl'>
          FundBridge хэрхэн ажилладаг вэ?
        </h2>
        <div className='grid gap-8 sm:grid-cols-2 lg:grid-cols-3'>
          {steps.map((step) => (
            <div
              key={step.title}
              className='rounded-lg bg-white p-6 shadow-sm hover:shadow-md transition-shadow'
            >
              <h3 className='mb-2 text-lg font-medium text-gray-800'>
                {step.title}
              </h3>
              <p className='text-gray-600'>{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
