'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function MarketplaceDetailPage() {
  const { id } = useParams();
  const [item, setItem] = useState<any>(null);

  useEffect(() => {
    // fetch item data from your source
    // e.g. setItem(mockItems.find(i => i.id === id))
    setItem({
      id,
      title: 'Ухаалаг бугуйн цаг',
      description: 'Хэрэглээний шилдэг технологи.',
      price: 120000,
      image: '/marketplace-item3.jpg',
    });
  }, [id]);

  if (!item) {
    return <div className='container mx-auto px-4 py-8'>Loading...</div>;
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <h1 className='mb-4 text-2xl font-semibold text-gray-800 sm:text-3xl'>
        {item.title}
      </h1>
      <img
        src={item.image}
        alt={item.title}
        className='mb-4 h-64 w-full object-cover rounded'
      />
      <p className='mb-4 text-gray-600'>{item.description}</p>
      <p className='text-lg text-gray-700'>Үнэ: {item.price} MNT</p>
      <button className='mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-500'>
        Худалдаж авах
      </button>
    </div>
  );
}
