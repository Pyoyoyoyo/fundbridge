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

interface Campaign {
  id: number;
  owner: string;
  title: string;
  description: string;
  goal: number;
  raised: number;
  isActive: boolean;
  imageUrl?: string;
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        let provider;
        if (typeof window !== 'undefined' && (window as any).ethereum) {
          provider = new ethers.BrowserProvider((window as any).ethereum);
          await provider.send('eth_requestAccounts', []);
        } else {
          provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
        }

        if (!provider) {
          throw new Error(
            'Ethereum холболт байхгүй байна. MetaMask суулгасан эсэхээ шалгана уу.'
          );
        }

        const contract = getFundraisingContract(provider);
        const data = await contract.getAllCampaigns();

        const parsed = data.map((c: any) => ({
          id: Number(c[0]),
          owner: c[1],
          title: c[2],
          description: c[3],
          goal: Number(c[4]),
          raised: Number(c[5]),
          isActive: c[6],
          imageUrl: c.length > 7 ? c[7] : '/placeholder.png',
        }));
        setCampaigns(parsed);
      } catch (err) {
        setError(
          'Кампанит ажлуудыг татаж чадсангүй. Сүлжээний тохиргоогоо шалгана уу.'
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
        <Link href='/campaigns/create'>
          <Button className='bg-blue-600 hover:bg-blue-500 text-white'>
            Кампанит ажил үүсгэх
          </Button>
        </Link>
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
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      )}
    </div>
  );
}

function CampaignCard({ campaign }: { campaign: Campaign }) {
  const progress = Math.min(
    (campaign.raised / campaign.goal) * 100,
    100
  ).toFixed(0);

  return (
    <Card className='bg-gray-100 shadow-lg hover:shadow-xl transition-shadow'>
      {campaign.imageUrl && (
        <img
          src={campaign.imageUrl}
          alt={campaign.title}
          className='h-40 w-full object-cover rounded-t-lg'
        />
      )}
      <CardHeader className='bg-blue-600 text-white p-4'>
        <CardTitle>{campaign.title}</CardTitle>
      </CardHeader>
      <CardContent className='p-4'>
        <p className='text-gray-900'>{campaign.description}</p>
        <Progress value={parseFloat(progress)} className='my-3 bg-gray-300' />
        <div className='mb-3 flex justify-between text-sm text-gray-900'>
          <span>
            Зорилго:{' '}
            <strong className='text-gray-900'>{campaign.goal} MNT</strong>
          </span>
          <span>
            Цугласан:{' '}
            <strong className='text-blue-600'>{campaign.raised} MNT</strong>
          </span>
        </div>
        <Link href={`/campaigns/${campaign.id}`}>
          <Button
            variant='outline'
            className='text-blue-600 border-blue-600 hover:bg-blue-100'
          >
            Дэлгэрэнгүй
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
