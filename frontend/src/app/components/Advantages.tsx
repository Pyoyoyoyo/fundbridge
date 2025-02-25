// src/components/Advantages.tsx
'use client';

export default function Advantages() {
  const items = [
    {
      title: 'Ил тод, найдвартай',
      description:
        'Бүх гүйлгээг блокчэйн дээр бүртгэснээр, санхүүгийн мэдээлэл өөрчлөгдөшгүй, ил тод байна.',
    },
    {
      title: 'Дэлхий нийтийн хамрах хүрээ',
      description:
        'Хөрөнгө оруулагчдыг улс орноор хязгаарлахгүй, дэлхийн өнцөг булан бүрээс дэмжлэг авах боломжтой.',
    },
    {
      title: 'Marketplace нэгдсэн',
      description:
        'Үнэт зүйлс эсвэл NFT-ээ худалдаалж, орлогоо шууд төслийн хөрөнгө босголтод зарцуулах боломжтой.',
    },
    {
      title: 'Олон төрлийн төлбөр',
      description:
        'Крипто (ETH, BTC) болон FIAT (карт, банк) ашиглан хөрөнгө оруулалт хийх уян хатан байдал.',
    },
    {
      title: 'Итгэлийн онооны систем',
      description:
        'Төслийн ашиглалт, тайланг ил тод тайлагнаснаар итгэлийн оноо нэмэгдүүлнэ.',
    },
    {
      title: 'Энгийн эхлэлт',
      description:
        'Төслөө богино хугацаанд үүсгэж, зорилго, хугацаагаа тодорхойлон хөрөнгө босгож эхлэх боломжтой.',
    },
  ];

  return (
    <section className='container mx-auto px-4 py-12'>
      <h2 className='mb-6 text-2xl font-semibold text-gray-800 sm:text-3xl'>
        FundBridge-ийн давуу талууд
      </h2>
      <div className='grid gap-8 sm:grid-cols-2 lg:grid-cols-3'>
        {items.map((item) => (
          <div
            key={item.title}
            className='rounded-lg border p-6 shadow-sm hover:shadow-md transition-shadow'
          >
            <h3 className='mb-2 text-lg font-medium text-gray-800'>
              {item.title}
            </h3>
            <p className='text-gray-600'>{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
