'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BrowserProvider } from 'ethers';
import { getMarketplaceContract } from '@/services/marketplaceConfig';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface MarketplaceItem {
  id: string;
  seller: string;
  title: string;
  description: string;
  price: number; // Энд та mock байдлаар Number гэж үзэж байна (wei эсвэл MNT)
  imageUrl: string;
  campaignId: number;
  isSold: boolean;
  isActive: boolean;
  metadataHash: string;
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

        // rawItems[i] = [
        //   id, seller, title, description, price, imageUrl,
        //   campaignId, isSold, isActive, metadataHash
        // ]

        const parsed: MarketplaceItem[] = rawItems.map((itm: any) => ({
          id: itm.id.toString(),
          seller: itm.seller,
          title: itm.title,
          description: itm.description,
          price: Number(itm.price), // wei гэж үзвэл parseInt, эсвэл BigInt-д parseEther хэрэглэж болно
          imageUrl: itm.imageUrl,
          campaignId: Number(itm.campaignId),
          isSold: itm.isSold,
          isActive: itm.isActive,
          metadataHash: itm.metadataHash,
        }));

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
    <Card className='bg-gray-100 shadow-lg hover:shadow-xl transition-shadow'>
      {/* Хэрэв зураг байвал дээр нь харуулна */}
      {item.imageUrl && (
        <img
          src={item.imageUrl}
          alt={item.title}
          className='h-40 w-full object-cover rounded-t-lg'
        />
      )}
      <CardHeader className='bg-blue-100 text-blue-600 p-4'>
        <CardTitle>{item.title}</CardTitle>
      </CardHeader>
      <CardContent className='p-4'>
        <p className='text-gray-900 mb-2'>{item.description}</p>

        <div className='mb-3 text-sm text-gray-900'>
          Үнэ (wei): <strong>{item.price}</strong>
        </div>

        {/* Дэлгэрэнгүй рүү орох товч */}
        <Link href={`/marketplace/${item.id}`}>
          <Button
            variant='outline'
            className='text-blue-600 border-blue-600 hover:bg-blue-100'
          >
            Дэлгэрэнгүй
          </Button>
        </Link>

        {/* Худалдаж авах товч */}
        <Link href={`/marketplace/${item.id}/buy`}>
          <Button className='bg-blue-600 text-white ml-3'>Худалдаж авах</Button>
        </Link>
      </CardContent>
    </Card>
  );
}
