'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ethers } from 'ethers';
import { motion } from 'framer-motion';

import { getFundraisingContract } from '@/services/contractConfig';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

// Lucide icons
import {
  BookOpen,
  Gift,
  Users,
  CreditCard,
  Megaphone,
  Info,
  ImageIcon,
} from 'lucide-react';

const ETH_TO_MNT_RATE = 6_000_000;

// IPFS дээр хадгалсан метадатагийн бүтэц (жишээ)
interface Metadata {
  basics?: {
    latePledges?: boolean;
    targetLaunchDate?: string;
    targetEndDate?: string;
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

// ----- Fallback ашиглах туслах функц -----
async function fetchMetadataWithFallback(cid: string) {
  // Fallback хийх дараалсан gateway-үүд
  const gateways = [
    `/api/pinataDownload?cid=${cid}`,
    `https://ipfs.io/ipfs/${cid}`,
    `https://gateway.pinata.cloud/ipfs/${cid}`,
  ];

  for (const url of gateways) {
    try {
      console.log('Trying fetch from:', url);
      const resp = await fetch(url);
      if (!resp.ok) {
        throw new Error(`HTTP ${resp.status} - ${resp.statusText}`);
      }
      // Амжилттай татсан бол JSON гэж үзээд parse хийнэ
      const data = await resp.json();
      return data;
    } catch (err) {
      console.warn(`Fetch failed from ${url}:`, err);
      // Алдаа гарсан бол дараагийн gateway руу үргэлжлүүлнэ
    }
  }

  // Хэрэв бүгд амжилтгүй бол:
  throw new Error('All gateway fetch attempts failed');
}

export default function CampaignDetailPage() {
  const { id } = useParams();
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

        // 2) Гэрээ дуудах
        const contract = getFundraisingContract(provider);
        const data = await contract.getCampaign(Number(id));

        // data: [id, owner, title, desc, goalWei, raisedWei, isActive, imageUrl, metadataHash, deadline]
        const rawGoalWei = data[4];
        const rawRaisedWei = data[5];

        const goalEth = parseFloat(ethers.formatEther(rawGoalWei));
        const raisedEth = parseFloat(ethers.formatEther(rawRaisedWei));

        const goalMnt = Math.floor(goalEth * ETH_TO_MNT_RATE);
        const raisedMnt = Math.floor(raisedEth * ETH_TO_MNT_RATE);

        const parsed = {
          id: Number(data[0]),
          owner: data[1],
          title: data[2],
          description: data[3],
          goalWei: rawGoalWei,
          raisedWei: rawRaisedWei,
          goalMnt,
          raisedMnt,
          isActive: data[6],
          imageUrl: data[7] || '',
          metadataHash: data[8] || '',
          deadline: Number(data[9]),
        };
        setCampaign(parsed);

        // 3) IPFS metadata татах (fallback-тайгаар)
        if (parsed.metadataHash) {
          try {
            const metaJson = await fetchMetadataWithFallback(
              parsed.metadataHash
            );
            setMetadata(metaJson);
          } catch (ipfsErr: any) {
            console.warn('IPFS fetch error:', ipfsErr.message);
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
      <div className='min-h-screen flex items-center justify-center'>
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

  // Calculate progress
  const progressPercent =
    campaign.goalMnt > 0
      ? Math.min((campaign.raisedMnt / campaign.goalMnt) * 100, 100).toFixed(0)
      : '0';

  return (
    <motion.div
      className='min-h-screen bg-gradient-to-b from-white to-blue-50 p-8 flex flex-col items-center gap-6'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className='w-full max-w-4xl flex flex-col gap-6'>
        {/* Main campaign card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className='bg-white shadow-lg hover:shadow-2xl rounded-lg transition-all'>
            <CardHeader className='bg-blue-100 text-blue-600 p-4 rounded-t-lg flex items-center gap-2'>
              <ImageIcon className='w-5 h-5' />
              <CardTitle className='text-2xl font-bold'>
                {campaign.title}
              </CardTitle>
            </CardHeader>
            <CardContent className='p-4 flex flex-col gap-4'>
              <p className='text-gray-800'>{campaign.description}</p>

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
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        '/frontend/public/images/home/hero-image.jpg';
                    }}
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

              {/* DonateButton нь таны бэлтгэсэн donate хийх UI / logic байхыг санана */}
              <Button className='w-full py-2 bg-blue-600 hover:bg-blue-500 text-white'>
                Хандив өгөх
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Metadata cards */}
        {metadata && (
          <motion.div
            className='flex flex-col gap-6'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            {/* Story */}
            <Card className='bg-white shadow rounded-lg transition-all hover:shadow-xl'>
              <CardHeader className='p-4 bg-blue-100 flex items-center gap-2'>
                <BookOpen className='w-5 h-5 text-blue-900' />
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
                  <p className='text-gray-700'>
                    {metadata?.story?.risks || '—'}
                  </p>
                </section>
                <section>
                  <h4 className='font-medium'>4. FAQ</h4>
                  <p className='text-gray-700'>{metadata?.story?.faq || '—'}</p>
                </section>
              </CardContent>
            </Card>

            {/* Rewards */}
            <Card className='bg-white shadow rounded-lg hover:shadow-xl transition-all'>
              <CardHeader className='p-4 bg-blue-100 flex items-center gap-2'>
                <Gift className='w-5 h-5 text-blue-900' />
                <CardTitle className='text-lg font-semibold text-blue-900'>
                  Rewards / Урамшуулал
                </CardTitle>
              </CardHeader>
              <CardContent className='p-4 flex flex-col gap-3'>
                <p className='text-gray-700'>
                  {metadata?.rewards?.description || '—'}
                </p>
                {metadata?.rewards?.items &&
                metadata.rewards.items.length > 0 ? (
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
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src =
                                '/images/no-image.png';
                            }}
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

            {/* People */}
            <Card className='bg-white shadow rounded-lg hover:shadow-xl transition-all'>
              <CardHeader className='p-4 bg-blue-100 flex items-center gap-2'>
                <Users className='w-5 h-5 text-blue-900' />
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

            {/* Payment Info */}
            <Card className='bg-white shadow rounded-lg hover:shadow-xl transition-all'>
              <CardHeader className='p-4 bg-blue-100 flex items-center gap-2'>
                <CreditCard className='w-5 h-5 text-blue-900' />
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

            {/* Promotion */}
            <Card className='bg-white shadow rounded-lg hover:shadow-xl transition-all'>
              <CardHeader className='p-4 bg-blue-100 flex items-center gap-2'>
                <Megaphone className='w-5 h-5 text-blue-900' />
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

            {/* Basics */}
            <Card className='bg-white shadow rounded-lg hover:shadow-xl transition-all'>
              <CardHeader className='p-4 bg-blue-100 flex items-center gap-2'>
                <Info className='w-5 h-5 text-blue-900' />
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
                <p className='text-sm text-gray-700'>
                  <strong>Target End Date:</strong>{' '}
                  {metadata?.basics?.targetEndDate || '—'}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
