'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ethers } from 'ethers';
import { getFundraisingContract } from '@/services/contractConfig';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

// Жишээ ханш: 1 ETH ~ 6,000,000 MNT (ойролцоогоор)
// Та бодит ханшаар тохируулж болно
const ETH_TO_MNT_RATE = 6000000;

export default function CampaignDonatePage() {
  const { id } = useParams();
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Хандивын дүн (UI дээр ETH-ээр оруулна)
  const [donationAmountEth, setDonationAmountEth] = useState('');

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

        const contract = getFundraisingContract(provider as any);
        const data = await contract.getCampaign(Number(id));
        // data: [id, owner, title, description, goal (wei?), raised (wei?), isActive, imageUrl, metadataHash]

        // (1) Гэрээнээс авсан дүнг parseEther биш, formatEther ашиглаж ETH болгож авч болно
        const rawGoalWei = data[4];
        const rawRaisedWei = data[5];

        // goal, raised нь wei гэж үзээд ETH рүү хөрвүүлнэ
        const goalEth = parseFloat(ethers.formatEther(rawGoalWei));
        const raisedEth = parseFloat(ethers.formatEther(rawRaisedWei));

        // (2) ETH → MNT рүү хөрвүүлнэ
        const goalMnt = Math.floor(goalEth * ETH_TO_MNT_RATE);
        const raisedMnt = Math.floor(raisedEth * ETH_TO_MNT_RATE);

        const parsed = {
          id: Number(data[0]),
          owner: data[1],
          title: data[2],
          description: data[3],
          goalWei: rawGoalWei,
          raisedWei: rawRaisedWei,
          // Хэрэглэгчдэд үзүүлэхдээ MNT-ээр харуулах
          goalMnt,
          raisedMnt,
          isActive: data[6],
          imageUrl: data[7] || '',
          metadataHash: data[8] || '',
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

  // Хандив өгөх
  async function handleDonate() {
    try {
      if (!window.ethereum) {
        alert('MetaMask not found!');
        return;
      }
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const contract = getFundraisingContract(signer);

      if (!donationAmountEth) {
        alert('Хандивын дүн (ETH) оруулна уу!');
        return;
      }

      // (3) Хэрэглэгчээс оруулсан ETH-ийг wei болгон хөрвүүлнэ
      const donationWei = ethers.parseEther(donationAmountEth);

      // contract.donate(campaignId) payable {...} гэж үзэж байна
      const tx = await contract.donate(Number(id), {
        value: donationWei,
      });
      await tx.wait();

      alert('Хандив амжилттай илгээлээ!');
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('Хандивын явцад алдаа гарлаа: ' + (err as Error).message);
    }
  }

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <Skeleton className='h-40 w-3/4 rounded-md bg-gray-300 animate-pulse' />
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

  // MNT-р харуулахын тулд campaign.goalMnt, campaign.raisedMnt ашиглана
  const progressPercent = Math.min(
    (campaign.raisedMnt / campaign.goalMnt) * 100,
    100
  ).toFixed(0);

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
                    {campaign.goalMnt} MNT
                  </strong>
                </span>
                <span>
                  Цугласан:{' '}
                  <strong className='font-medium text-blue-600'>
                    {campaign.raisedMnt} MNT
                  </strong>
                </span>
              </div>
            </div>

            {/* Хандивын дүн оруулах хэсэг (ETH) */}
            <div className='flex flex-col gap-2'>
              <label className='text-sm text-gray-600'>
                Хандивын дүн (ETH)
              </label>
              <input
                type='number'
                step='0.0001'
                min='0'
                value={donationAmountEth}
                onChange={(e) => setDonationAmountEth(e.target.value)}
                className='
                  border border-gray-300 rounded px-3 py-2 
                  focus:outline-none focus:ring-2 focus:ring-blue-500 
                  transition-colors
                '
                placeholder='Жишээ нь 0.01'
              />
              <p className='text-xs text-gray-500'>
                1 ETH ~ {ETH_TO_MNT_RATE.toLocaleString('en-US')} MNT
                (ойролцоогоор)
              </p>
            </div>

            <Button
              className='bg-blue-600 hover:bg-blue-500 text-white w-full py-2'
              onClick={handleDonate}
            >
              Хандив өгөх
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
