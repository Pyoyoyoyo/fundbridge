'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ethers } from 'ethers';
import { getFundraisingContract } from '@/services/contractConfig';

// UI компонентууд
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import DonateButton from '@/components/ui/DonateButton';

// 1 ETH ~ 6,000,000 MNT (жишээ ханш)
const ETH_TO_MNT_RATE = 6_000_000;

// IPFS дээр хадгалсан метадатагийн бүтэц (жишээ)
interface Metadata {
  basics?: {
    latePledges?: boolean;
    targetLaunchDate?: string;
  };
  rewards?: {
    items: Array<{
      name: string;
      description: string;
      image?: string;
    }>;
    description?: string;
  };
  story?: {
    introduceProject?: string;
    storyDetail?: string;
    risks?: string;
    faq?: string;
  };
  people?: {
    vanityURL?: string;
    demographics?: string;
    collaborators?: string;
  };
  paymentInfo?: {
    bankInfo?: string;
    cryptoWallet?: string;
  };
  promotion?: {
    marketingPlan?: string;
    socialMedia?: string;
  };
}

export default function CampaignDetailPage() {
  const { id } = useParams(); // /campaigns/[id] гэх мэт
  const [campaign, setCampaign] = useState<any>(null);
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCampaign() {
      try {
        setLoading(true);

        // 1) Provider
        let provider: ethers.BrowserProvider | ethers.JsonRpcProvider;
        if ((window as any)?.ethereum) {
          provider = new ethers.BrowserProvider((window as any).ethereum);
          await provider.send('eth_requestAccounts', []);
        } else {
          provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
        }

        const contract = getFundraisingContract(provider);

        // 2) getCampaign(...) – ганц кампанит ажлын өгөгдлийг татна
        // data: [id, owner, title, description, goalWei, raisedWei, isActive, imageUrl, metadataHash]
        const data = await contract.getCampaign(Number(id));

        // 3) goal, raised нь wei хэлбэртэй гэж үзээд ETH → MNT рүү хөрвүүлнэ
        const rawGoalWei = data[4]; // bigint
        const rawRaisedWei = data[5]; // bigint

        const goalEth = parseFloat(ethers.formatEther(rawGoalWei));
        const raisedEth = parseFloat(ethers.formatEther(rawRaisedWei));

        const goalMnt = Math.floor(goalEth * ETH_TO_MNT_RATE);
        const raisedMnt = Math.floor(raisedEth * ETH_TO_MNT_RATE);

        // 4) UI-д ашиглах обьект
        const parsed = {
          id: Number(data[0]),
          owner: data[1],
          title: data[2],
          description: data[3],
          goalWei: rawGoalWei, // Хэрэв дахин ашиглах бол
          raisedWei: rawRaisedWei,
          goalMnt,
          raisedMnt,
          isActive: data[6],
          imageUrl: data[7] || '',
          metadataHash: data[8] || '',
        };
        setCampaign(parsed);

        // 5) IPFS metadata татах (metadataHash байвал)
        if (parsed.metadataHash) {
          try {
            const ipfsUrl = `https://ipfs.io/ipfs/${parsed.metadataHash}`;
            const ipfsRes = await fetch(ipfsUrl);
            if (ipfsRes.ok) {
              const metaJson = await ipfsRes.json();
              setMetadata(metaJson);
            } else {
              console.warn(
                'IPFS-ээс metadata татахад амжилтгүй:',
                ipfsRes.status
              );
            }
          } catch (ipfsErr) {
            console.warn('IPFS fetch error:', ipfsErr);
          }
        }
      } catch (err) {
        console.error(err);
        setError('Алдаа гарлаа: ' + (err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchCampaign();
  }, [id]);

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

  // MNT дүнгийн progress %
  const progressPercent =
    campaign.goalMnt > 0
      ? Math.min((campaign.raisedMnt / campaign.goalMnt) * 100, 100).toFixed(0)
      : '0';

  return (
    <div
      className='
        min-h-screen 
        bg-gradient-to-b from-white to-blue-50 
        p-8 
        flex flex-col items-center
        gap-6 
        animate-in fade-in
      '
    >
      <div className='w-full max-w-4xl flex flex-col gap-6'>
        {/* Кампанит ажлын үндсэн Card */}
        <Card className='bg-white shadow-lg transition-all duration-300 hover:shadow-2xl rounded-lg'>
          <CardHeader className='bg-blue-100 text-blue-600 p-4 rounded-t-lg'>
            <CardTitle className='text-2xl font-bold'>
              {campaign.title}
            </CardTitle>
          </CardHeader>
          <CardContent className='p-4 flex flex-col gap-4'>
            <p className='text-gray-800'>{campaign.description}</p>

            {/* Зураг */}
            {campaign.imageUrl && (
              <div className='overflow-hidden rounded-lg mt-2'>
                <img
                  src={campaign.imageUrl}
                  alt='Campaign'
                  className='
                    w-full h-auto object-cover 
                    transition-transform duration-300 
                    hover:scale-105
                  '
                />
              </div>
            )}

            {/* Progress */}
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

            {/* Хандив өгөх товч */}
            <DonateButton
              campaignId={campaign.id}
              className='w-full py-2 bg-blue-600 hover:bg-blue-500 text-white'
            />
          </CardContent>
        </Card>

        {/* Хэрэв IPFS metadata байгаа бол бүх Story, Rewards, People, PaymentInfo, Promotion, Basics гэх мэт харуулна */}
        {/* Fallback байдлаар metadata байхгүй байсан ч UI үзүүлэх жишээ */}
        <div className='flex flex-col gap-6'>
          {/* Story (metadata?.story) */}
          <Card className='bg-white shadow rounded-lg transition-all hover:shadow-xl'>
            <CardHeader className='p-4 bg-blue-100'>
              <CardTitle className='text-lg font-semibold text-blue-900'>
                Төслийн дэлгэрэнгүй (Story)
              </CardTitle>
            </CardHeader>
            <CardContent className='p-4 flex flex-col gap-3'>
              <section>
                <h4 className='font-medium'>1. Төслөө танилцуул</h4>
                <p className='text-gray-700'>
                  {metadata?.story?.introduceProject || '—'}
                </p>
              </section>
              <section>
                <h4 className='font-medium'>2. Төслийн түүх</h4>
                <p className='text-gray-700'>
                  {metadata?.story?.storyDetail || '—'}
                </p>
              </section>
              <section>
                <h4 className='font-medium'>3. Эрсдэл ба сорилтууд</h4>
                <p className='text-gray-700'>{metadata?.story?.risks || '—'}</p>
              </section>
              <section>
                <h4 className='font-medium'>4. FAQ</h4>
                <p className='text-gray-700'>{metadata?.story?.faq || '—'}</p>
              </section>
            </CardContent>
          </Card>

          {/* Rewards (metadata?.rewards) */}
          <Card className='bg-white shadow rounded-lg hover:shadow-xl transition-all'>
            <CardHeader className='p-4 bg-blue-100'>
              <CardTitle className='text-lg font-semibold text-blue-900'>
                Rewards / Урамшуулал
              </CardTitle>
            </CardHeader>
            <CardContent className='p-4 flex flex-col gap-3'>
              <p className='text-gray-700'>
                {metadata?.rewards?.description || '—'}
              </p>
              {metadata?.rewards?.items && metadata.rewards.items.length > 0 ? (
                <ul className='mt-2 space-y-3'>
                  {metadata.rewards.items.map((item, idx) => (
                    <li
                      key={idx}
                      className='border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors'
                    >
                      <h5 className='font-semibold mb-1'>{item.name}</h5>
                      <p className='text-sm text-gray-600 mb-2'>
                        {item.description}
                      </p>
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className='
                            rounded-lg object-cover h-auto w-full
                            transition-transform duration-300 hover:scale-105
                          '
                        />
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className='text-sm text-gray-500'>
                  Урамшууллын мэдээлэл алга байна.
                </p>
              )}
            </CardContent>
          </Card>

          {/* People (metadata?.people) */}
          <Card className='bg-white shadow rounded-lg hover:shadow-xl transition-all'>
            <CardHeader className='p-4 bg-blue-100'>
              <CardTitle className='text-lg font-semibold text-blue-900'>
                Хамтрагчид / Баг (People)
              </CardTitle>
            </CardHeader>
            <CardContent className='p-4 flex flex-col gap-2'>
              <p className='text-sm text-gray-700'>
                <strong>Vanity URL:</strong>{' '}
                {metadata?.people?.vanityURL || '—'}
              </p>
              <p className='text-sm text-gray-700'>
                <strong>Demographics:</strong>{' '}
                {metadata?.people?.demographics || '—'}
              </p>
              <p className='text-sm text-gray-700'>
                <strong>Collaborators:</strong>{' '}
                {metadata?.people?.collaborators || '—'}
              </p>
            </CardContent>
          </Card>

          {/* Payment Info (metadata?.paymentInfo) */}
          <Card className='bg-white shadow rounded-lg hover:shadow-xl transition-all'>
            <CardHeader className='p-4 bg-blue-100'>
              <CardTitle className='text-lg font-semibold text-blue-900'>
                Төлбөрийн мэдээлэл (Payment Info)
              </CardTitle>
            </CardHeader>
            <CardContent className='p-4 flex flex-col gap-2'>
              <p className='text-sm text-gray-700'>
                <strong>Банкны данс:</strong>{' '}
                {metadata?.paymentInfo?.bankInfo || '—'}
              </p>
              <p className='text-sm text-gray-700'>
                <strong>Crypto Wallet:</strong>{' '}
                {metadata?.paymentInfo?.cryptoWallet || '—'}
              </p>
            </CardContent>
          </Card>

          {/* Promotion (metadata?.promotion) */}
          <Card className='bg-white shadow rounded-lg hover:shadow-xl transition-all'>
            <CardHeader className='p-4 bg-blue-100'>
              <CardTitle className='text-lg font-semibold text-blue-900'>
                Promotion / Marketing
              </CardTitle>
            </CardHeader>
            <CardContent className='p-4 flex flex-col gap-2'>
              <p className='text-sm text-gray-700'>
                <strong>Маркетингийн төлөвлөгөө:</strong>{' '}
                {metadata?.promotion?.marketingPlan || '—'}
              </p>
              <p className='text-sm text-gray-700'>
                <strong>Social Media:</strong>{' '}
                {metadata?.promotion?.socialMedia || '—'}
              </p>
            </CardContent>
          </Card>

          {/* Basics (metadata?.basics) */}
          <Card className='bg-white shadow rounded-lg hover:shadow-xl transition-all'>
            <CardHeader className='p-4 bg-blue-100'>
              <CardTitle className='text-lg font-semibold text-blue-900'>
                Нэмэлт үндсэн мэдээлэл (Basics)
              </CardTitle>
            </CardHeader>
            <CardContent className='p-4 flex flex-col gap-2'>
              <p className='text-sm text-gray-700'>
                <strong>Late Pledges:</strong>{' '}
                {metadata?.basics?.latePledges ? 'Тийм' : 'Үгүй'}
              </p>
              <p className='text-sm text-gray-700'>
                <strong>Target Launch Date:</strong>{' '}
                {metadata?.basics?.targetLaunchDate || '—'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
