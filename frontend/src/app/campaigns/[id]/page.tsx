'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ethers } from 'ethers';
import { motion } from 'framer-motion';

import { getFundraisingContract } from '@/services/fundraisingConfig';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

import CampaignHeaderSection from '@/components/campaigns/[id]/CampaignHeaderSection';
import TabButtonsSection from '@/components/campaigns/[id]/TabButtonsSection';
import TabsContentSection from '@/components/campaigns/[id]/TabsContentSection';
import DonateSection from '@/components/campaigns/[id]/DonateSection';
import TeamSection from '@/components/campaigns/[id]/TeamSection';

import { Campaign } from '@/app/interfaces';

const ETH_TO_MNT_RATE = 6_000_000;

// IPFS fallback fetch
async function fetchMetadataWithFallback(cid: string) {
  const gateways = [
    `/api/pinataDownload?cid=${cid}`,
    `https://ipfs.io/ipfs/${cid}`,
    `https://gateway.pinata.cloud/ipfs/${cid}`,
  ];
  for (const url of gateways) {
    try {
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      return data;
    } catch (e) {
      console.warn(`Failed to fetch from ${url}`);
    }
  }
  throw new Error('All IPFS fetch attempts failed');
}

function computeStatus(c: Campaign): string {
  if (!c.isActive)
    return c.wasGoalReached
      ? 'Хугацаа дууссан (Амжилттай)'
      : 'Хугацаа дууссан (Амжилтгүй)';
  if (!c.wasGoalReached && c.raisedWei === BigInt(0)) return 'Шинээр үүссэн';
  return 'Хэрэгжиж байгаа';
}

export default function CampaignDetailPage() {
  const { id } = useParams();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [metadata, setMetadata] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    'detail' | 'risks' | 'faq' | 'people' | 'rewards' | 'comments' | 'payment'
  >('detail');

  useEffect(() => {
    async function detectUser() {
      if ((window as any)?.ethereum) {
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const accounts = await provider.send('eth_requestAccounts', []);
        if (accounts.length > 0) setCurrentUser(accounts[0].toLowerCase());
      }
    }
    detectUser();
  }, []);

  useEffect(() => {
    async function fetchCampaign() {
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

        const goalEth = parseFloat(ethers.formatEther(data[5]));
        const raisedEth = parseFloat(ethers.formatEther(data[6]));

        const campaignObj: Campaign = {
          id: Number(data[0]),
          owner: (data[1] as string).toLowerCase(),
          title: data[2],
          primaryCategory: data[3],
          description: data[4],
          goalWei: BigInt(data[5].toString()),
          raisedWei: BigInt(data[6].toString()),
          goalMnt: Math.floor(goalEth * ETH_TO_MNT_RATE),
          raisedMnt: Math.floor(raisedEth * ETH_TO_MNT_RATE),
          isActive: data[7],
          imageUrl: data[8] || '',
          metadataHash: data[9] || '',
          deadline: Number(data[10]),
          wasGoalReached: data[11],
        };

        setCampaign(campaignObj);

        if (campaignObj.metadataHash) {
          try {
            const metaJson = await fetchMetadataWithFallback(
              campaignObj.metadataHash
            );
            setMetadata(metaJson);
          } catch (e) {
            console.warn('IPFS fetch error:', e);
          }
        }
      } catch (err: any) {
        console.error(err);
        setError('Алдаа гарлаа: ' + err.message);
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchCampaign();
  }, [id]);

  if (loading) {
    return (
      <div className='min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white to-blue-50'>
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

  const isOwner = currentUser === campaign.owner;

  return (
    <motion.div
      className='min-h-screen bg-gradient-to-b from-white to-blue-50 p-4'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className='max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Зүүн хэсэг */}
        <div className='lg:col-span-2 space-y-4'>
          <CampaignHeaderSection campaign={campaign} isOwner={isOwner} />
          <div className='bg-white shadow rounded-lg p-4'>
            <TabButtonsSection
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
            <TabsContentSection
              activeTab={activeTab}
              metadata={metadata}
              campaignId={campaign.id}
            />
          </div>
        </div>

        {/* Баруун хэсэг */}
        <div className='space-y-4 lg:sticky lg:top-6 self-start h-fit'>
          <DonateSection campaign={campaign} isOwner={isOwner} />
          <TeamSection
            metadata={metadata}
            onFAQClick={() => setActiveTab('faq')}
          />
        </div>
      </div>
    </motion.div>
  );
}
