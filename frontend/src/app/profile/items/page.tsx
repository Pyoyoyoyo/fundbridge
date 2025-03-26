'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { BrowserProvider, ethers } from 'ethers';
import { motion } from 'framer-motion';

import { getMarketplaceContract } from '@/services/marketplaceConfig';
import { getFundraisingContract } from '@/services/fundraisingConfig';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import { ShoppingBag } from 'lucide-react';

// MarketplaceItem интерфэйс
import { MarketplaceItem } from '@/app/interfaces';

// MarketplaceCard компонентоо import
import { MarketplaceCard } from '@/components/profile/marketplace/marketplaceCard';

export default function MyItemsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [myItems, setMyItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Хэрэглэгч нэвтрээгүй бол /login руу чиглүүлэх
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchMyItems() {
      try {
        setLoading(true);
        setError(null);

        if (!session?.user) {
          throw new Error('Not logged in');
        }
        if (!(window as any).ethereum) {
          throw new Error('MetaMask not found');
        }

        // 1) Ethers provider
        const provider = new BrowserProvider((window as any).ethereum);
        await provider.send('eth_requestAccounts', []);
        const signer = await provider.getSigner();

        // 2) Marketplace гэрээнээс бүх item‐уудыг татаж, өөрийнхийгөө шүүнэ
        const marketplace = getMarketplaceContract(signer);
        const rawItems = await marketplace.getAllItems();

        const accounts = await provider.send('eth_accounts', []);
        const currentUser = (accounts[0] as string).toLowerCase();

        const filtered = rawItems.filter((it: any) => {
          const seller = (it.seller as string).toLowerCase();
          return seller === currentUser;
        });

        // 3) Тухайн item бүрийн campaignId‐аар Fundraising гэрээнээс campaign мэдээлэл татна
        const fundraising = getFundraisingContract(signer);

        // parsedItems-д бид campaign-ийн goalMnt, raisedMnt гэх мэт нэмж оруулна
        const parsedItems: MarketplaceItem[] = [];

        for (const it of filtered) {
          const itemId = Number(it.id);
          const campaignId = Number(it.campaignId);

          // Анхлан parse
          const parsedItem: MarketplaceItem = {
            id: itemId,
            seller: it.seller,
            buyer: it.buyer,
            title: it.title,
            description: it.description,
            price: it.price.toString(), // wei
            imageUrl: it.imageUrl,
            isSold: it.isSold,
            isActive: it.isActive,
            campaignId,
          };

          // Хэрэв campaignId > 0 байвал FundraisingContract‐аас татна
          if (campaignId > 0) {
            const c = await fundraising.getCampaign(campaignId);
            // c = [id, owner, title, category, desc, goalWei, raisedWei, isActive, imageUrl, metadataHash, deadline, wasGoalReached]
            const goalWei = c[5];
            const raisedWei = c[6];

            // MNT рүү хөрвүүлэх
            const goalEth = parseFloat(ethers.formatEther(goalWei));
            const raisedEth = parseFloat(ethers.formatEther(raisedWei));
            const goalMnt = Math.floor(goalEth * 6_000_000);
            const raisedMnt = Math.floor(raisedEth * 6_000_000);

            // parsedItem дотор campaignGoalMnt, campaignRaisedMnt гэх мэт туслах талбаруудыг хадгалъя
            // (Та MarketplaceItem интерфэйсээ өргөтгөж болно)
            (parsedItem as any).campaignGoalMnt = goalMnt;
            (parsedItem as any).campaignRaisedMnt = raisedMnt;
          }

          parsedItems.push(parsedItem);
        }

        setMyItems(parsedItems);
      } catch (err: any) {
        console.error('Failed to fetch my items:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (status === 'authenticated') {
      fetchMyItems();
    }
  }, [status, session]);

  if (status === 'loading') {
    return (
      <div className='p-4'>
        <Skeleton className='h-8 w-1/2 mb-2' />
        <Skeleton className='h-6 w-1/3' />
      </div>
    );
  }

  return (
    <motion.div
      className='max-w-5xl mx-auto p-4 space-y-6'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className='flex items-center gap-2 text-blue-600'
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <ShoppingBag className='w-6 h-6 text-blue-500' />
        <h1 className='text-2xl font-bold'>Миний Зарсан Бараа</h1>
      </motion.div>

      {loading ? (
        <div className='space-y-2'>
          <Skeleton className='h-5 w-1/2' />
          <Skeleton className='h-5 w-3/4' />
        </div>
      ) : error ? (
        <Alert variant='destructive' className='m-2'>
          <AlertTitle>Алдаа</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : myItems.length === 0 ? (
        <div className='text-gray-600 flex flex-col items-center py-4'>
          <img
            src='/images/empty-state.png'
            alt='No items'
            className='w-32 h-32 object-contain mb-2 opacity-70'
          />
          <p className='text-sm'>Та одоогоор бараа зарж байршуулсангүй.</p>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-3'>
          {myItems.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.01 }}
              className='transition'
            >
              {/* 
                MarketplaceCard руу дамжуулахдаа campaignGoalMnt, campaignRaisedMnt 
                гэх мэт талбаруудыг (as any) дамжуулна.
              */}
              <MarketplaceCard item={item} currentUser={item.seller} />
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
