'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BrowserProvider } from 'ethers';
import { getMarketplaceContract } from '@/services/marketplaceConfig';

interface MarketplaceItem {
  id: string;
  title: string;
  description: string;
  price: number; // MNT
  image?: string;
  campaignId?: number; // Аль кампанит ажилд хандив оруулахыг заана
}

export default function MarketplacePage() {
  const [items, setItems] = useState<MarketplaceItem[]>([]);

  useEffect(() => {
    async function fetchItems() {
      try {
        if (!(window as any).ethereum) {
          console.warn('MetaMask not found!');
          return;
        }
        const provider = new BrowserProvider((window as any).ethereum);
        await provider.send('eth_requestAccounts', []);
        const signer = await provider.getSigner();

        const contract = getMarketplaceContract(signer);
        const rawItems = await contract.getAllItems();
        console.log('rawItems:', rawItems);
        const parsed = rawItems.map((item: any) => ({
          id: item.id.toString(),
          title: item.title,
          description: item.description,
          price: Number(item.price),
          image: item.imageUrl,
          campaignId: Number(item.campaignId),
        })) as MarketplaceItem[];

        setItems(parsed);
      } catch (err) {
        console.error('Failed to fetch marketplace items:', err);
      }
    }

    fetchItems();
  }, []);

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='mb-4 flex items-center justify-between'>
        <h1 className='text-2xl font-semibold text-gray-800 sm:text-3xl'>
          Marketplace
        </h1>
        <Link
          href='/marketplace/create'
          className='rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-500'
        >
          Item зарах
        </Link>
      </div>
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
    <div
      className='
        rounded-lg border bg-white p-4 shadow-sm 
        hover:shadow-md transition-shadow 
        animate-in fade-in
      '
    >
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
        Үнэ: <strong>{item.price.toLocaleString()} MNT</strong>
      </div>

      <Link
        href={`/marketplace/${item.id}`}
        className='block rounded bg-blue-600 px-4 py-2 text-center text-white hover:bg-blue-500'
      >
        Дэлгэрэнгүй
      </Link>
    </div>
  );
}
