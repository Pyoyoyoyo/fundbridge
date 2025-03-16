'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ethers } from 'ethers';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { getFundraisingContract } from '@/services/contractConfig';

// Жишээ ханш: 1 ETH ~ 6,000,000 MNT
const ETH_TO_MNT_RATE = 6_000_000;

export default function CampaignDonatePage() {
  const { id } = useParams();
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Хандивын дүн (UI дээр MNT‐ээр оруулна)
  const [donationAmountMnt, setDonationAmountMnt] = useState('');
  // Хандив өгч буй эсэх (Spinner or disabled button)
  const [donating, setDonating] = useState(false);

  useEffect(() => {
    async function fetchCampaign() {
      try {
        setLoading(true);

        // MetaMask эсвэл fallback provider
        let provider: ethers.BrowserProvider | ethers.JsonRpcProvider;
        if ((window as any)?.ethereum) {
          provider = new ethers.BrowserProvider((window as any).ethereum);
          await provider.send('eth_requestAccounts', []);
        } else {
          provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
        }

        const contract = getFundraisingContract(provider as any);
        const data = await contract.getCampaign(Number(id));
        // data: [id, owner, title, primaryCategory, description, goalWei, raisedWei, isActive, imageUrl, metadataHash, deadline]
        // Та гэрээн доторх талбарын байрлалаа шалгаарай
        const rawGoalWei = data[5];
        const rawRaisedWei = data[6];

        const goalEth = parseFloat(ethers.formatEther(rawGoalWei));
        const raisedEth = parseFloat(ethers.formatEther(rawRaisedWei));

        const goalMnt = Math.floor(goalEth * ETH_TO_MNT_RATE);
        const raisedMnt = Math.floor(raisedEth * ETH_TO_MNT_RATE);

        const parsed = {
          id: Number(data[0]),
          owner: data[1],
          title: data[2],
          primaryCategory: data[3],
          description: data[4],
          goalWei: rawGoalWei,
          raisedWei: rawRaisedWei,
          goalMnt,
          raisedMnt,
          isActive: data[7],
          imageUrl: data[8] || '',
          metadataHash: data[9] || '',
          deadline: Number(data[10]) || 0,
        };

        setCampaign(parsed);
      } catch (err) {
        console.error(err);
        setError('Алдаа гарлаа: ' + (err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchCampaign();
  }, [id]);

  // Хандив өгөх (MNT → ETH → Wei)
  async function handleDonate() {
    try {
      // 1) donating эхлүүлнэ
      setDonating(true);

      if (!window.ethereum) {
        alert('MetaMask not found!');
        return;
      }
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const contract = getFundraisingContract(signer);

      // MNT оруулаагүй бол
      if (!donationAmountMnt || Number(donationAmountMnt) <= 0) {
        alert('Хандивын дүн (MNT) оруулна уу!');
        return;
      }

      // 2) MNT → ETH
      const mntValue = parseFloat(donationAmountMnt);
      const ethValue = mntValue / ETH_TO_MNT_RATE;

      // toFixed(18) → parseEther
      const ethString = ethValue.toFixed(18);
      const donationWei = ethers.parseEther(ethString);

      // 3) donate(campaignId) + { value: donationWei }
      const tx = await contract.donate(Number(id), {
        value: donationWei,
      });
      await tx.wait();

      alert('Хандив амжилттай илгээлээ!');
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('Хандивын явцад алдаа гарлаа: ' + (err as Error).message);
    } finally {
      // 4) donating дууслаа
      setDonating(false);
    }
  }

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
      <Alert
        variant='destructive'
        className='m-4 bg-red-600 text-white animate-in fade-in'
      >
        <AlertTitle>Алдаа</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!campaign) {
    return (
      <Alert variant='destructive' className='m-4 bg-red-600 text-white'>
        <AlertTitle>Алдаа</AlertTitle>
        <AlertDescription>Кампанит ажил олдсонгүй.</AlertDescription>
      </Alert>
    );
  }

  // MNT‐ийн хувьд дэлгэцэнд харуулах progress
  const progressPercent = campaign.goalMnt
    ? Math.min((campaign.raisedMnt / campaign.goalMnt) * 100, 100).toFixed(0)
    : '0';

  return (
    <div className='min-h-screen bg-gradient-to-b from-white to-blue-50 p-8 flex flex-col items-center gap-6 animate-in fade-in'>
      <div className='w-full max-w-4xl flex flex-col gap-6'>
        <Card className='bg-white shadow-lg transition-all duration-300 hover:shadow-2xl rounded-lg'>
          <CardHeader className='bg-blue-100 text-blue-600 p-4 rounded-t-lg'>
            <CardTitle className='text-2xl font-bold'>
              {campaign.title} — Хандив өгөх
            </CardTitle>
          </CardHeader>
          <CardContent className='p-4 flex flex-col gap-4'>
            <p className='text-gray-800'>{campaign.description}</p>

            {campaign.imageUrl && (
              <div className='overflow-hidden rounded-lg mt-2'>
                <img
                  src={campaign.imageUrl}
                  alt='Campaign'
                  className='w-full h-auto object-cover transition-transform duration-300 hover:scale-105'
                />
              </div>
            )}

            <div className='mt-2'>
              <Progress
                value={parseFloat(progressPercent)}
                className='my-3 bg-gray-200'
              />
              <div className='mb-3 flex justify-between text-sm text-gray-800'>
                <span>
                  Зорилго:{' '}
                  <strong className='font-medium'>
                    {campaign.goalMnt.toLocaleString()} MNT
                  </strong>
                </span>
                <span>
                  Цугласан:{' '}
                  <strong className='font-medium text-blue-600'>
                    {campaign.raisedMnt.toLocaleString()} MNT
                  </strong>
                </span>
              </div>
            </div>

            {/* Хандивын дүн (MNT) оруулах хэсэг */}
            <div className='flex flex-col gap-2'>
              <label className='text-sm text-gray-600'>
                Хандивын дүн (MNT)
              </label>
              <input
                type='number'
                step='1'
                min='0'
                value={donationAmountMnt}
                onChange={(e) => setDonationAmountMnt(e.target.value)}
                className='
                  border border-gray-300 rounded px-3 py-2 
                  focus:outline-none focus:ring-2 focus:ring-blue-500 
                  transition-colors
                '
                placeholder='Жишээ нь 10000'
                disabled={donating}
              />
              <p className='text-xs text-gray-500'>
                1 ETH ~ {ETH_TO_MNT_RATE.toLocaleString('en-US')} MNT
                (ойролцоогоор)
              </p>
            </div>

            <Button
              className='bg-blue-600 hover:bg-blue-500 text-white w-full py-2'
              onClick={handleDonate}
              disabled={donating}
            >
              {donating ? 'Илгээж байна...' : 'Хандив өгөх'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
