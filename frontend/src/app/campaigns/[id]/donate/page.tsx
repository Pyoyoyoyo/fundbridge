'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ethers } from 'ethers';
import { motion } from 'framer-motion';

import { getFundraisingContract } from '@/services/fundraisingConfig';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import DonateSection from '@/components/campaigns/[id]/donate/DonateSection'; // 3 tabs (fiat, eth, card)

const ETH_TO_MNT_RATE = 6_000_000;

export default function DonatePage() {
  const { id } = useParams();
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        let provider: ethers.BrowserProvider | ethers.JsonRpcProvider;
        if ((window as any)?.ethereum) {
          provider = new ethers.BrowserProvider((window as any).ethereum);
          await provider.send('eth_requestAccounts', []);
        } else {
          provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
        }

        const contract = getFundraisingContract(provider);
        const data = await contract.getCampaign(Number(id));

        // data: [id, owner, title, category, description, goalWei, raisedWei, isActive, imageUrl, metadataHash, deadline]
        const rawGoalWei = data[5];
        const rawRaisedWei = data[6];

        const goalEth = parseFloat(ethers.formatEther(rawGoalWei));
        const raisedEth = parseFloat(ethers.formatEther(rawRaisedWei));
        const goalMnt = Math.floor(goalEth * ETH_TO_MNT_RATE);
        const raisedMnt = Math.floor(raisedEth * ETH_TO_MNT_RATE);

        setCampaign({
          id: Number(data[0]),
          owner: data[1],
          title: data[2],
          category: data[3],
          description: data[4],
          goalWei: rawGoalWei,
          raisedWei: rawRaisedWei,
          goalMnt,
          raisedMnt,
          isActive: data[7],
          imageUrl: data[8] || '',
          metadataHash: data[9] || '',
          deadline: Number(data[10]),
        });
      } catch (err: any) {
        console.error(err);
        setError('Кампанийн мэдээллийг татахад алдаа гарлаа: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className='min-h-screen flex flex-col items-center justify-center bg-gray-50'>
        <Skeleton className='h-40 w-3/4 rounded-md bg-gray-300 animate-pulse' />
        <p className='text-gray-500 mt-2'>Ачааллаж байна...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant='destructive' className='m-4'>
        <AlertTitle>Алдаа</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!campaign) {
    return (
      <Alert variant='destructive' className='m-4'>
        <AlertTitle>Алдаа</AlertTitle>
        <AlertDescription>Кампанит ажил олдсонгүй.</AlertDescription>
      </Alert>
    );
  }

  const progressPercent =
    campaign.goalMnt > 0
      ? Math.min((campaign.raisedMnt / campaign.goalMnt) * 100, 100).toFixed(0)
      : '0';

  // deadline
  const nowSec = Math.floor(Date.now() / 1000);
  const timeLeftSec = campaign.deadline - nowSec;
  let timeLeftText = '';
  if (timeLeftSec <= 0) {
    timeLeftText = 'Хугацаа дууссан';
  } else {
    const days = Math.floor(timeLeftSec / 86400);
    const hours = Math.floor((timeLeftSec % 86400) / 3600);
    const minutes = Math.floor(((timeLeftSec % 86400) % 3600) / 60);
    timeLeftText = `${days} өдөр ${hours} цаг ${minutes} мин үлдлээ`;
  }

  return (
    <motion.div
      className='min-h-screen bg-gradient-to-b from-white to-blue-50 p-8'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className='max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8'>
        {/* Зүүн талд: Кампанийн үндсэн мэдээлэл */}
        <div className='bg-white rounded shadow p-4'>
          <h1 className='text-2xl font-bold text-gray-800'>{campaign.title}</h1>
          <p className='text-sm text-blue-600'>{campaign.category}</p>
          <p className='text-gray-700 mt-2'>{campaign.description}</p>

          {campaign.imageUrl && (
            <div className='mt-3 rounded overflow-hidden'>
              <motion.img
                src={campaign.imageUrl}
                alt='Campaign'
                className='w-full h-auto object-cover transition-transform duration-300 hover:scale-105'
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    '/images/no-image.png';
                }}
              />
            </div>
          )}

          <div className='mt-4'>
            <Progress
              value={parseFloat(progressPercent)}
              className='my-3 bg-gray-200'
            />
            <div className='mb-3 flex justify-between text-sm text-gray-800'>
              <span>
                Зорилго:{' '}
                <strong>{campaign.goalMnt.toLocaleString()} MNT</strong>
              </span>
              <span>
                Цугласан:{' '}
                <strong className='text-blue-600'>
                  {campaign.raisedMnt.toLocaleString()} MNT
                </strong>
              </span>
            </div>
            <p className='text-sm text-gray-500'>
              Төслийн үлдсэн хугацаа: <strong>{timeLeftText}</strong>
            </p>
          </div>
        </div>

        {/* Баруун талд: DonateSection */}
        <DonateSection campaignId={campaign.id} />
      </div>
    </motion.div>
  );
}
