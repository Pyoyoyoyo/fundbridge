'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { BrowserProvider, ethers } from 'ethers';
import { motion } from 'framer-motion';

// Та өөрийн Fundraising гэрээг дуудахад ашигладаг туслах функцийг импорт
import { getFundraisingContract } from '@/services/fundraisingConfig';

// UI жишээ
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Briefcase } from 'lucide-react';

// Campaign интерфэйс
import { Campaign } from '@/app/interfaces/campaign/campaignData';

// CampaignCard компонентоо import
import { CampaignCard } from '@/components/profile/campaigns/campaignCard';

export default function MyCampaignsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [myCampaigns, setMyCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Хэрэглэгч нэвтрээгүй бол /login руу чиглүүлэх
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // -----------------------------------------------------
  // 1) Миний үүсгэсэн кампаниудыг татах
  // -----------------------------------------------------
  useEffect(() => {
    async function fetchMyCampaigns() {
      try {
        setLoading(true);
        setError(null);

        if (!session?.user) {
          throw new Error('Not logged in');
        }
        if (!(window as any).ethereum) {
          throw new Error('MetaMask not found');
        }

        // MetaMask provider
        const provider = new BrowserProvider((window as any).ethereum);
        await provider.send('eth_requestAccounts', []);
        const signer = await provider.getSigner();

        // Fundraising гэрээ дуудаж бүх кампаниудыг авах
        const fundraising = getFundraisingContract(signer);
        const rawCampaigns = await fundraising.getAllCampaigns();

        // Одоогийн metamask account
        const accounts = await provider.send('eth_accounts', []);
        const currentUser = (accounts[0] as string).toLowerCase();

        // Өөрийн үүсгэсэн (owner === currentUser) кампанит ажлуудыг шүүх
        const filtered = rawCampaigns.filter((c: any) => {
          const owner = (c[1] as string).toLowerCase();
          return owner === currentUser;
        });

        // parse
        const parsed: Campaign[] = filtered.map((c: any) => {
          // goalWei, raisedWei нь BigNumber эсвэл bigint
          const goalWei = BigInt(c[5].toString());
          const raisedWei = BigInt(c[6].toString());

          // Ether -> MNT (1 ETH ~ 6,000,000 MNT гэж үзье)
          const goalEth = parseFloat(ethers.formatEther(goalWei));
          const raisedEth = parseFloat(ethers.formatEther(raisedWei));

          const goalMnt = Math.floor(goalEth * 6_000_000);
          const raisedMnt = Math.floor(raisedEth * 6_000_000);

          return {
            id: Number(c[0]),
            owner: c[1],
            title: c[2],
            primaryCategory: c[3],
            description: c[4],
            goalWei,
            raisedWei,
            isActive: c[7],
            imageUrl: c[8] || '',
            metadataHash: c[9] || '',
            // Мөн campaign.interface.ts дотор goalMnt, raisedMnt талбаруудыг нэмж тодорхойлсон гэж үзнэ
            goalMnt,
            raisedMnt,
          };
        });

        setMyCampaigns(parsed);
      } catch (err: any) {
        console.error('Failed to fetch my campaigns:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (status === 'authenticated') {
      fetchMyCampaigns();
    }
  }, [status, session]);

  // -----------------------------------------------------
  // Rendering
  // -----------------------------------------------------
  if (loading) {
    return (
      <div className='min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white to-blue-50'>
        <Skeleton className='h-40 w-3/4 rounded-md bg-gray-300 animate-pulse' />
        <p className='text-gray-500 mt-2'>Ачааллаж байна...</p>
      </div>
    );
  }

  return (
    <motion.div
      className='max-w-5xl mx-auto p-6 space-y-6 my-4 bg-white shadow-md rounded-lg'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <motion.div
        className='flex items-center gap-2 text-blue-600'
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <Briefcase className='w-6 h-6 text-blue-500' />
        <h1 className='text-2xl font-bold'>Миний Кампанит Ажил</h1>
      </motion.div>

      {loading ? (
        // Loading state
        <div className='space-y-2'>
          <Skeleton className='h-5 w-1/2' />
          <Skeleton className='h-5 w-3/4' />
        </div>
      ) : error ? (
        // Алдаа
        <Alert variant='destructive' className='m-2'>
          <AlertTitle>Алдаа</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : myCampaigns.length === 0 ? (
        // Хоосон
        <div className='text-gray-600 flex flex-col items-center py-4'>
          <img
            src='/images/empty-state.png'
            alt='No campaigns'
            className='w-32 h-32 object-contain mb-2 opacity-70'
          />
          <p className='text-sm'>Та одоогоор кампанит ажил үүсгээгүй байна.</p>
        </div>
      ) : (
        // Өөрийн кампаниуд
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-3'>
          {myCampaigns.map((camp) => (
            <motion.div
              key={camp.id}
              whileHover={{ scale: 1.01 }}
              className='transition'
            >
              {/* CampaignCard руу goalMnt, raisedMnt дамжуулсан учраас тэнд харагдана */}
              <CampaignCard campaign={camp} currentUser={camp.owner} />
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
