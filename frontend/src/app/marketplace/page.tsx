'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface MarketplaceItem {
  id: string;
  title: string;
  description: string;
  price: number;
  image?: string;
  // any other fields, e.g. "seller", "category", "donateToCampaign" etc.
}

export default function MarketplacePage() {
  const [items, setItems] = useState<MarketplaceItem[]>([]);

  // In a real app, fetch from your blockchain or an API
  useEffect(() => {
    const mockItems: MarketplaceItem[] = [
      {
        id: 'item1',
        title: 'Ном: Блокчейн технологи',
        description: 'Шинэ үеийн санхүү, технологийн үндсэн ойлголтууд.',
        price: 15000,
        image: '/marketplace-item1.png',
      },
      {
        id: 'item2',
        title: 'Ил захидал: Урам зориг',
        description: 'Урам зориг хайрласан, ил захидал хэвлэл.',
        price: 5000,
        image: '/marketplace-item2.png',
      },
      {
        id: 'item3',
        title: 'Ухаалаг бугуйн цаг',
        description: 'Хэрэглээний шилдэг технологи.',
        price: 120000,
        image: '/marketplace-item3.jpg',
      },
    ];
    setItems(mockItems);
  }, []);

  return (
    <div className='container mx-auto px-4 py-8'>
      <h1 className='mb-4 text-2xl font-semibold text-gray-800 sm:text-3xl'>
        Marketplace
      </h1>
      <p className='mb-8 text-gray-600'>
        Үнэт зүйлсээ зарж, олсон орлогоо шууд төслүүдэд хандивлах, эсвэл
        худалдаж авах боломжтой зах зээл.
      </p>

      <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
        {items.map((item) => (
          <MarketplaceCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

function MarketplaceCard({ item }: { item: MarketplaceItem }) {
  return (
    <div className='rounded-lg border bg-white p-4 shadow-sm hover:shadow-md transition-shadow'>
      {/* Optional image */}
      {item.image && (
        <img
          src={item.image}
          alt={item.title}
          className='mb-3 h-40 w-full rounded object-cover'
        />
      )}

      <h2 className='mb-2 text-lg font-semibold text-gray-800'>{item.title}</h2>
      <p className='text-sm text-gray-600'>{item.description}</p>

      <div className='my-3 text-sm text-gray-600'>
        Үнэ: <strong>{item.price} MNT</strong>
      </div>

      <Link
        href={`/marketplace/${item.id}`}
        className='block rounded bg-blue-600 px-4 py-2 text-center text-white hover:bg-blue-500'
      >
        Дэлгэрэнгүй
      </Link>
      {/* Or link to a detail page:
          <Link href={`/marketplace/${item.id}`} ... />
      */}
    </div>
  );
}
