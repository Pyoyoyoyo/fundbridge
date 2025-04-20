'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BrowserProvider } from 'ethers';
import { getMarketplaceContract } from '@/services/marketplaceConfig';
import { motion } from 'framer-motion';
import { MarketplaceItem } from '@/app/interfaces';
import { MarketplaceCard } from '@/components/marketplace/MarketplaceCard';
import { Skeleton } from '@/components/ui/skeleton';

export default function MarketplacePage() {
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      if ((window as any).ethereum) {
        const provider = new BrowserProvider((window as any).ethereum);
        const accounts = await provider.send('eth_requestAccounts', []);
        setCurrentUser(accounts[0]);
      }

      try {
        const provider = new BrowserProvider((window as any).ethereum);
        const signer = await provider.getSigner();
        const contract = getMarketplaceContract(signer);
        const rawItems = await contract.getAllItems();

        const parsedItems: MarketplaceItem[] = rawItems.map((itm: any) => ({
          id: itm.id.toString(),
          seller: itm.seller,
          buyer: itm.buyer,
          title: itm.title,
          description: itm.description,
          price: itm.price.toString(),
          imageUrl: itm.imageUrl,
          campaignId: Number(itm.campaignId),
          isSold: itm.isSold,
          isActive: itm.isActive,
          metadataHash: itm.metadataHash,
        }));

        setItems(parsedItems);
      } catch (err) {
        console.error('Failed to fetch marketplace items:', err);
        setError('Marketplace item-уудыг татахад алдаа гарлаа.');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  // 🚀 Зарагдсан болон Зарагдаагүй гэж групплэх
  const statusGroups: { [key: string]: MarketplaceItem[] } = {
    Зарагдаагүй: [],
    Зарагдсан: [],
  };

  items.forEach((item) => {
    if (item.isSold) {
      statusGroups['Зарагдсан'].push(item);
    } else {
      statusGroups['Зарагдаагүй'].push(item);
    }
  });

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

      {loading ? (
        <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className='h-64 w-full rounded-md bg-gray-300' />
          ))}
        </div>
      ) : (
        <>
          <p className='mb-8 text-gray-600'>
            Үнэт зүйлсээ зарж, төслүүдийг шууд дэмжээрэй!
          </p>

          {Object.entries(statusGroups).map(([status, groupItems]) => {
            if (groupItems.length === 0) return null;
            return (
              <div key={status} className='mb-10'>
                <h2 className='text-2xl font-bold text-gray-800 mb-4'>
                  {status}
                </h2>
                <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
                  {groupItems.map((item) => (
                    <MarketplaceCard
                      key={item.id}
                      item={item}
                      currentUser={currentUser}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
