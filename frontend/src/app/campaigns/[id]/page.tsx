'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ethers } from 'ethers';
import { AnimatePresence, motion } from 'framer-motion';

import { getFundraisingContract } from '@/services/fundraisingConfig';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import DonateButton from '@/components/ui/DonateButton';

// Tab Components
import DetailTab from '@/components/campaign/[id]/tabs/DetailTab';
import RisksTab from '@/components/campaign/[id]/tabs/RisksTab';
import FAQTab from '@/components/campaign/[id]/tabs/FAQTab';
import PeopleTab from '@/components/campaign/[id]/tabs/PeopleTab';
import RewardsTab from '@/components/campaign/[id]/tabs/RewardsTab';
import PaymentTab from '@/components/campaign/[id]/tabs/PaymentTab';

// Жишээ: Төслийн баг, эзэмшигчийн мэдээлэл харуулах жижиг компонент
import TeamCard from '@/components/campaign/[id]/tabs/TeamCard';
import { TabButton } from '@/components/ui/TabButton';
import { Info, ParkingCircle } from 'lucide-react';
import WarningBoxes from '@/components/campaign/[id]/tabs/WarningBoxes';
import CommentsTab from '@/components/campaign/[id]/tabs/CommentsTab';
import { Campaign } from '@/app/interfaces';

const ETH_TO_MNT_RATE = 6_000_000;

// ----- Fallback ашиглах туслах функц (IPFS JSON татах) -----
async function fetchMetadataWithFallback(cid: string) {
  const gateways = [
    `/api/pinataDownload?cid=${cid}`,
    `https://ipfs.io/ipfs/${cid}`,
    `https://gateway.pinata.cloud/ipfs/${cid}`,
  ];
  for (const url of gateways) {
    try {
      const resp = await fetch(url);
      if (!resp.ok) {
        throw new Error(`HTTP ${resp.status} - ${resp.statusText}`);
      }
      const data = await resp.json();
      return data;
    } catch (err) {
      console.warn(`Fetch failed from ${url}:`, err);
    }
  }
  throw new Error('All gateway fetch attempts failed');
}
function computeStatus(c: Campaign): string {
  // Campaign интерфэйст wasGoalReached: boolean гэж нэмсэн гэж үзье
  if (!c.isActive) {
    // Хаагдсан
    if (c.wasGoalReached) {
      return 'Хугацаа дууссан (Амжилттай)';
    } else {
      return 'Хугацаа дууссан (Амжилтгүй)';
    }
  } else {
    // Идэвхтэй
    if (!c.wasGoalReached && c.raisedWei === BigInt(0)) {
      return 'Шинээр үүссэн';
    } else {
      return 'Хэрэгжиж байгаа';
    }
  }
}

type ActiveTab =
  | 'detail'
  | 'risks'
  | 'faq'
  | 'people'
  | 'rewards'
  | 'comments'
  | 'payment';

export default function CampaignDetailPage() {
  const { id } = useParams();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [metadata, setMetadata] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('detail');

  // ---------------------------
  // 1) currentUser (MetaMask)
  // ---------------------------
  useEffect(() => {
    async function detectUser() {
      if ((window as any)?.ethereum) {
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const accounts = await provider.send('eth_requestAccounts', []);
        if (accounts.length > 0) {
          setCurrentUser(accounts[0].toLowerCase());
        }
      }
    }
    detectUser();
  }, []);

  // ---------------------------
  // 2) Кампанийн мэдээлэл татах
  // ---------------------------
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
        // data = [
        //   0: id,
        //   1: owner,
        //   2: title,
        //   3: primaryCategory,
        //   4: description,
        //   5: goalWei,
        //   6: raisedWei,
        //   7: isActive,
        //   8: imageUrl,
        //   9: metadataHash,
        //   10: deadline,
        //   11: wasGoalReached
        // ];

        const rawGoalWei = data[5];
        const rawRaisedWei = data[6];

        const goalEth = parseFloat(ethers.formatEther(rawGoalWei));
        const raisedEth = parseFloat(ethers.formatEther(rawRaisedWei));

        const goalMnt = Math.floor(goalEth * ETH_TO_MNT_RATE);
        const raisedMnt = Math.floor(raisedEth * ETH_TO_MNT_RATE);

        const campaignObj: Campaign = {
          id: Number(data[0]),
          owner: (data[1] as string).toLowerCase(),
          title: data[2],
          primaryCategory: data[3],
          description: data[4],
          goalWei: BigInt(rawGoalWei.toString()),
          raisedWei: BigInt(rawRaisedWei.toString()),
          goalMnt,
          raisedMnt,
          isActive: data[7],
          imageUrl: data[8] || '',
          metadataHash: data[9] || '',
          deadline: Number(data[10]),
          wasGoalReached: data[11],
        };

        setCampaign(campaignObj);

        // Metadata татах
        if (campaignObj.metadataHash) {
          try {
            // Та IPFS fallback fetch логикоороо metadata-гаа татна
            const metaJson = await fetchMetadataWithFallback(
              campaignObj.metadataHash
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

  // ---------------------------
  // Rendering
  // ---------------------------
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
        <div className='flex items-center gap-2 text-red-600'>
          <AlertTitle>Алдаа</AlertTitle>
        </div>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!campaign) {
    return (
      <Alert variant='destructive' className='m-4'>
        <div className='flex items-center gap-2 text-red-600'>
          <AlertTitle>Алдаа</AlertTitle>
        </div>
        <AlertDescription>Кампанит ажил олдсонгүй.</AlertDescription>
      </Alert>
    );
  }

  // (A) Төлөв, эзэмшигч, зорилгодоо хүрсэн эсэх
  const status = computeStatus(campaign);
  const isOwner = currentUser === campaign.owner; // Тухайн metamask хэрэглэгч owner мөн эсэх
  const goalReached = campaign.raisedWei >= campaign.goalWei;

  // (B) Хугацааны үлдсэн цаг
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

  // (C) Дэвшил (MNT)
  const progressPercent =
    campaign.goalMnt > 0
      ? Math.min((campaign.raisedMnt / campaign.goalMnt) * 100, 100).toFixed(0)
      : '0';

  return (
    <motion.div
      className='min-h-screen bg-gradient-to-b from-white to-blue-50 p-8'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className='max-w-7xl mx-auto'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* --------------------------------
                LEFT: Tabs (2 col-span)
            -------------------------------- */}
          <div className='lg:col-span-2 space-y-4'>
            {/* Campaign Header */}
            <div className='bg-white shadow-lg rounded-lg p-4'>
              <h1 className='text-2xl font-bold text-gray-800'>
                {campaign.title}
              </h1>
              <p className='text-sm text-blue-600'>
                {campaign.primaryCategory}
              </p>
              <p className='text-gray-700 mt-2 leading-relaxed'>
                {campaign.description}
              </p>

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

              {/* Хэрэв эзэмшигч бол энэ текстийг үзүүлэх */}
              {isOwner && (
                <p className='mt-3 text-sm text-green-600 font-medium'>
                  Та энэ кампанит ажлын эзэмшигч байна.
                </p>
              )}
            </div>

            {/* Tabs */}
            <div className='bg-white shadow rounded-lg p-4'>
              <div className='border-b border-gray-200 flex gap-4 pb-2'>
                <TabButton
                  label='Дэлгэрэнгүй'
                  isActive={activeTab === 'detail'}
                  onClick={() => setActiveTab('detail')}
                />
                <TabButton
                  label='Эрсдэл'
                  isActive={activeTab === 'risks'}
                  onClick={() => setActiveTab('risks')}
                />
                <TabButton
                  label='FAQ'
                  isActive={activeTab === 'faq'}
                  onClick={() => setActiveTab('faq')}
                />
                <TabButton
                  label='Баг'
                  isActive={activeTab === 'people'}
                  onClick={() => setActiveTab('people')}
                />
                <TabButton
                  label='Урамшуулал'
                  isActive={activeTab === 'rewards'}
                  onClick={() => setActiveTab('rewards')}
                />
                <TabButton
                  label='Санхүүжилт'
                  isActive={activeTab === 'payment'}
                  onClick={() => setActiveTab('payment')}
                />
                <TabButton
                  label='Сэтгэгдэл'
                  isActive={activeTab === 'comments'}
                  onClick={() => setActiveTab('comments')}
                />
              </div>

              <div className='mt-4'>
                {activeTab === 'detail' && <DetailTab metadata={metadata} />}
                {activeTab === 'risks' && <RisksTab metadata={metadata} />}
                {activeTab === 'faq' && <FAQTab metadata={metadata} />}
                {activeTab === 'people' && <PeopleTab metadata={metadata} />}
                {activeTab === 'rewards' && <RewardsTab metadata={metadata} />}
                {activeTab === 'payment' && <PaymentTab metadata={metadata} />}
                {activeTab === 'comments' && (
                  <CommentsTab campaignId={campaign.id} />
                )}
              </div>

              <WarningBoxes />
            </div>
          </div>

          {/* --------------------------------
                RIGHT: Donate + TeamCard + ...
            -------------------------------- */}
          <div className='space-y-4 lg:sticky lg:top-6 self-start h-fit'>
            {/* Хандивын мэдээлэл */}
            <div className='bg-white shadow rounded-lg p-4'>
              <h3 className='text-xl font-semibold text-gray-800 mb-2'>
                Хандивын мэдээлэл
              </h3>

              <div className='my-2'>
                <Progress
                  value={parseFloat(progressPercent)}
                  className='my-2 bg-gray-200'
                />
                <div className='text-sm text-gray-800 flex justify-between'>
                  <span>
                    Зорилго:{' '}
                    <strong>{campaign.goalMnt.toLocaleString()}₮</strong>
                  </span>
                  <span>
                    Цугласан:{' '}
                    <strong className='text-blue-600'>
                      {campaign.raisedMnt.toLocaleString()}₮
                    </strong>
                  </span>
                </div>
              </div>

              <p className='text-sm text-gray-600 mt-2'>
                Төслийн үлдсэн хугацаа:{' '}
                <strong className='text-blue-600'>{timeLeftText}</strong>
              </p>

              {/* Хандивын товч — зөвхөн идэвхтэй үед */}
              {campaign.isActive ? (
                <DonateButton
                  campaignId={campaign.id}
                  className='w-full py-2 bg-blue-600 hover:bg-blue-500 text-white mt-3'
                />
              ) : (
                <p className='text-red-500 font-medium mt-3'>
                  Энэ кампанит ажил хаагдсан байна
                </p>
              )}

              {/* Хөрөнгө татах товч — зөвхөн эзэмшигч, идэвхтэй, зорилгодоо хүрсэн үед */}
              {isOwner && campaign.isActive && goalReached && (
                <div className='mt-4'>
                  <a href={`/campaigns/${campaign.id}/withdraw`}>
                    <Button
                      variant='outline'
                      className='text-blue-600 border-blue-600 hover:bg-blue-100 w-full'
                    >
                      Хөрөнгө татах
                    </Button>
                  </a>
                </div>
              )}

              {/* Тайлан гаргах товч — зөвхөн эзэмшигч, хаагдсан, амжилттай үед */}
              {isOwner && !campaign.isActive && campaign.wasGoalReached && (
                <div className='mt-4'>
                  <a href={`/campaigns/${campaign.id}/report`}>
                    <Button
                      variant='outline'
                      className='text-blue-600 border-blue-600 hover:bg-blue-100 w-full'
                    >
                      Тайлан гаргах
                    </Button>
                  </a>
                </div>
              )}
            </div>

            {/* Төслийн баг */}
            <TeamCard
              collaborators={
                metadata?.people?.collaborators
                  ? metadata.people.collaborators
                  : []
              }
            />

            {/* FAQ + Гомдол */}
            <div className='bg-white shadow rounded-lg p-4'>
              <p className='text-gray-700 text-sm mb-2'>
                Хэрэв танд төслийн талаар асуулт байвал{' '}
                <button
                  onClick={() => setActiveTab('faq')}
                  className='text-blue-600 underline'
                >
                  FAQ
                </button>{' '}
                хэсгээс харна уу.
              </p>
              <button
                onClick={() => alert('Гомдол мэдүүлэх процесс...')}
                className='text-sm text-red-600 underline'
              >
                Гомдол мэдүүлэх
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
