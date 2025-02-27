'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ethers } from 'ethers';
import { getFundraisingContract } from '@/services/contractConfig';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function CampaignDetailPage() {
  const { id } = useParams();
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCampaign() {
      try {
        let provider;
        if (typeof window !== 'undefined' && (window as any).ethereum) {
          provider = new ethers.BrowserProvider((window as any).ethereum);
          await provider.send('eth_requestAccounts', []);
        } else {
          provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
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
        }));

        const found = parsed.find((c: any) => c.id === Number(id));
        setCampaign(found);
      } catch (err) {
        setError('Кампанит ажлыг татаж чадсангүй.');
      } finally {
        setLoading(false);
      }
    }

    fetchCampaign();
  }, [id]);

  if (loading) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <Skeleton className='h-40 w-full rounded-md bg-gray-300' />
      </div>
    );
  }

  if (!campaign) {
    return (
      <Alert variant='destructive' className='bg-gray-900 text-white'>
        <AlertTitle>Алдаа</AlertTitle>
        <AlertDescription>Кампанит ажил олдсонгүй.</AlertDescription>
      </Alert>
    );
  }

  const progress = Math.min(
    (campaign.raised / campaign.goal) * 100,
    100
  ).toFixed(0);

  return (
    <div className='container mx-auto px-4 py-8'>
      <Card className='bg-gray-100 shadow-lg hover:shadow-xl transition-shadow'>
        <CardHeader className='bg-blue-600 text-white p-4 rounded-t-lg'>
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
          <Button className='bg-blue-600 hover:bg-blue-500 text-white w-full'>
            Хандив өгөх
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
