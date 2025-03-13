'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ethers } from 'ethers';
import { getFundraisingContract } from '@/services/contractConfig';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useSession } from 'next-auth/react';
import DonateButton from '@/components/ui/DonateButton';

// 1 ETH ~ 6,000,000 MNT (жишээ ханш)
const ETH_TO_MNT_RATE = 6000000;

interface Campaign {
  id: number;
  owner: string;
  title: string;
  description: string;
  goalWei: bigint;
  raisedWei: bigint;
  goalMnt: number;
  raisedMnt: number;
  isActive: boolean;
  imageUrl?: string;
  metadataHash?: string;
  metadata?: any;
}

export default function CampaignsPage() {
  const { data: session } = useSession();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Хэрэглэгчийн MetaMask address авч хадгална
  useEffect(() => {
    async function detectUser() {
      if ((window as any)?.ethereum) {
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const accounts = await provider.send('eth_requestAccounts', []);
        setCurrentUser(accounts[0]);
      }
    }
    detectUser();
  }, []);

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
        const data = await contract.getAllCampaigns();
        // data[i] = [id, owner, title, description, goalWei, raisedWei, isActive, imageUrl, metadataHash]

        const campaignsParsed: Campaign[] = [];

        for (const c of data) {
          const rawGoalWei = c[4];
          const rawRaisedWei = c[5];

          const goalEth = parseFloat(ethers.formatEther(rawGoalWei));
          const raisedEth = parseFloat(ethers.formatEther(rawRaisedWei));
          const goalMnt = Math.floor(goalEth * ETH_TO_MNT_RATE);
          const raisedMnt = Math.floor(raisedEth * ETH_TO_MNT_RATE);

          const campaignObj: Campaign = {
            id: Number(c[0]),
            owner: c[1],
            title: c[2],
            description: c[3],
            goalWei: rawGoalWei,
            raisedWei: rawRaisedWei,
            goalMnt,
            raisedMnt,
            isActive: c[6],
            imageUrl: c[7] || '/placeholder.png',
            metadataHash: c[8] || '',
            metadata: null,
          };

          campaignsParsed.push(campaignObj);
        }

        setCampaigns(campaignsParsed);
      } catch (err) {
        console.error(err);
        setError(
          'Кампанит ажлуудыг татаж чадсангүй: ' + (err as Error).message
        );
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <div className='container mx-auto px-4 py-8 bg-white'>
      <div className='mb-6 flex items-center justify-between'>
        <h1 className='text-3xl font-bold text-blue-600'>
          Бүх кампанит ажлууд
        </h1>
        {session?.user && (
          <Link href='/campaigns/create'>
            <Button className='bg-blue-600 hover:bg-blue-500 text-white'>
              Кампанит ажил үүсгэх
            </Button>
          </Link>
        )}
      </div>

      {error && (
        <Alert
          variant='destructive'
          className='bg-red-600 text-white p-4 rounded-lg'
        >
          <AlertTitle>⚠️ Алдаа гарлаа</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className='h-64 w-full rounded-md bg-gray-300' />
          ))}
        </div>
      ) : (
        <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
          {campaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              currentUser={currentUser}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CampaignCard({
  campaign,
  currentUser,
}: {
  campaign: Campaign;
  currentUser: string | null;
}) {
  const progress =
    campaign.goalMnt > 0
      ? Math.min((campaign.raisedMnt / campaign.goalMnt) * 100, 100).toFixed(0)
      : '0';

  const isOwner =
    currentUser && currentUser.toLowerCase() === campaign.owner.toLowerCase();

  return (
    <Card className='bg-gray-100 shadow-lg hover:shadow-xl transition-shadow'>
      {campaign.imageUrl && (
        <img
          src={campaign.imageUrl}
          alt={campaign.title}
          className='h-40 w-full object-cover rounded-t-lg'
        />
      )}
      <CardHeader className='bg-blue-100 text-blue-600 p-4'>
        <CardTitle>{campaign.title}</CardTitle>
      </CardHeader>
      <CardContent className='p-4'>
        <p className='text-gray-900 mb-2'>{campaign.description}</p>

        <Progress value={parseFloat(progress)} className='my-3 bg-gray-300' />
        <div className='mb-3 flex justify-between text-sm text-gray-900'>
          <span>
            Зорилго:{' '}
            <strong className='text-gray-900'>
              {campaign.goalMnt.toLocaleString()} MNT
            </strong>
          </span>
          <span>
            Цугласан:{' '}
            <strong className='text-blue-600'>
              {campaign.raisedMnt.toLocaleString()} MNT
            </strong>
          </span>
        </div>

        <div className='flex items-center gap-2'>
          <Link href={`/campaigns/${campaign.id}`}>
            <Button
              variant='outline'
              className='text-blue-600 border-blue-600 hover:bg-blue-100'
            >
              Дэлгэрэнгүй
            </Button>
          </Link>
          {/* Хандивын товч */}
          <DonateButton
            campaignId={campaign.id}
            className='bg-blue-600 hover:bg-blue-500 text-white'
          />
        </div>

        {/* Эзэмшигчийн хувьд илүү мэдээлэл харуулах (жишээ) */}
        {isOwner && (
          <p className='mt-3 text-sm text-green-600 font-medium'>
            Та энэ кампанит ажлын эзэмшигч байна.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
