'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BrowserProvider, ethers } from 'ethers';
import { getMarketplaceContract } from '@/services/marketplaceConfig';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';

interface MarketplaceItem {
  id: string;
  seller: string;
  buyer: string;
  title: string;
  description: string;
  /**
   * PRICE-ийг string болгож авна.
   * Учир нь 16,666,666,666,666,666 гэх мэт нь JS Number-т багтахгүй байж болзошгүй.
   */
  price: string; // <-- string хэлбэртэй хадгална
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

        const parsed: MarketplaceItem[] = rawItems.map((itm: any) => ({
          id: itm.id.toString(),
          seller: itm.seller,
          buyer: itm.buyer,
          title: itm.title,
          description: itm.description,
          /**
           * contract-аас ирж буй itm.price нь BigNumber эсвэл bigint төрлийн утга.
           * toString() -оор хөрвүүлж string хэлбэрт хадгална.
           */
          price: itm.price.toString(), // <-- энд string болгож авна
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
        <motion.h1
          className='text-2xl font-semibold text-gray-800 sm:text-3xl'
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Marketplace
        </motion.h1>
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
  /**
   * price нь string хэлбэртэй. formatEther дотор BigInt руу хөрвүүлнэ.
   */
  const priceWei = BigInt(item.price); // string -> BigInt
  const priceEthString = ethers.formatEther(priceWei); // "0.016666..." гэх мэт
  const priceEthNum = parseFloat(priceEthString); // 0.0166666...
  const approximateMnt = Math.floor(priceEthNum * 6_000_000);

  return (
    <motion.div
      whileHover={{ scale: 1.02, boxShadow: '0px 8px 16px rgba(0,0,0,0.2)' }}
      transition={{ duration: 0.3 }}
    >
      <Card className='bg-gray-100 shadow-lg hover:shadow-xl transition-shadow'>
        {item.imageUrl && (
          <motion.img
            src={item.imageUrl}
            alt={item.title}
            className='h-40 w-full object-cover rounded-t-lg'
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          />
        )}
        <CardHeader className='bg-blue-100 text-blue-600 p-4 flex items-center gap-2'>
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
          >
            <ShoppingCart className='w-6 h-6' />
          </motion.div>
          <CardTitle>{item.title}</CardTitle>
        </CardHeader>
        <CardContent className='p-4'>
          <p className='text-gray-900 mb-2'>{item.description}</p>

          {/* Үнийн мэдээлэл */}
          <div className='mb-3 text-sm text-gray-900'>
            <p>
              Үнэ (ETH):{' '}
              <strong className='text-blue-600'>{priceEthString} ETH</strong>
            </p>
            <p>
              Үнэ (MNT, ойролцоогоор):{' '}
              <strong className='text-blue-600'>
                {approximateMnt.toLocaleString()} MNT
              </strong>
            </p>
          </div>

          {/* Худалдаж авах эсвэл зарагдсан эсэх */}
          {item.isSold ? (
            <div className='text-red-600 font-medium'>
              Энэ item аль хэдийн зарагдсан байна!
            </div>
          ) : (
            <div className='flex items-center gap-3'>
              <Link href={`/marketplace/${item.id}`}>
                <Button
                  variant='outline'
                  className='text-blue-600 border-blue-600 hover:bg-blue-100'
                >
                  Дэлгэрэнгүй
                </Button>
              </Link>
              <Link href={`/marketplace/${item.id}/buy`}>
                <Button className='bg-blue-600 text-white'>
                  Худалдаж авах
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
