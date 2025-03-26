'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BrowserProvider } from 'ethers';
import { getMarketplaceContract } from '@/services/marketplaceConfig';
import { motion } from 'framer-motion';
import { MarketplaceItem } from '@/app/interfaces';
import { MarketplaceCard } from '@/components/marketplace/MarketplaceCard';

export default function MarketplacePage() {
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      // (1) MetaMask address‐ээ currentUser state‐д оноох
      if ((window as any).ethereum) {
        const provider = new BrowserProvider((window as any).ethereum);
        const accounts = await provider.send('eth_requestAccounts', []);
        setCurrentUser(accounts[0]);
      }

      // (2) Marketplace‐ээс item‐үүдээ татах
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
          price: itm.price.toString(), // BigInt => string
          imageUrl: itm.imageUrl,
          campaignId: Number(itm.campaignId),
          isSold: itm.isSold,
          isActive: itm.isActive,
          metadataHash: itm.metadataHash,
        }));

        setItems(parsedItems);
      } catch (err) {
        console.error('Failed to fetch marketplace items:', err);
      }
    }
    init();
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
          <MarketplaceCard
            key={item.id}
            item={item}
            currentUser={currentUser}
          />
        ))}
      </div>
    </div>
  );
}
