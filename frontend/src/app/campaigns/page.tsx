'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ethers } from 'ethers';
import { useSession } from 'next-auth/react';

import { getFundraisingContract } from '@/services/contractConfig';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import DonateButton from '@/components/ui/DonateButton';

// Lucide icons
import { Search, Filter, XCircle } from 'lucide-react';

// 1 ETH ~ 6,000,000 MNT (жишээ ханш)
const ETH_TO_MNT_RATE = 6_000_000;

interface Campaign {
  id: number;
  owner: string;
  title: string;
  primaryCategory: string; // "Хандив" эсвэл "Хөрөнгө оруулалт"
  description: string;
  goalWei: bigint;
  raisedWei: bigint;
  goalMnt: number;
  raisedMnt: number;
  isActive: boolean;
  imageUrl: string;
  metadataHash: string;
}

export default function CampaignsPage() {
  const { data: session } = useSession();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Хайлт & фильтрийн state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState(''); // 'хандив', 'хөрөнгө оруулалт', эсвэл ''

  // 1) currentUser
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

  // 2) Кампанит ажлуудыг татах
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
        // data[i] = struct Campaign:
        // [
        //   id, owner, title, primaryCategory, description,
        //   goal, raised, isActive, imageUrl, metadataHash, deadline
        // ]

        const parsedCampaigns: Campaign[] = data.map((c: any) => {
          // c[0] => id
          // c[1] => owner
          // c[2] => title
          // c[3] => primaryCategory
          // c[4] => description
          // c[5] => goal (wei)
          // c[6] => raised (wei)
          // c[7] => isActive
          // c[8] => imageUrl
          // c[9] => metadataHash
          // c[10] => deadline (timestamp) -- хэрэв танд хэрэгтэй бол ашиглаж болно

          const goalWei = c[5] as bigint;
          const raisedWei = c[6] as bigint;

          const goalEth = parseFloat(ethers.formatEther(goalWei));
          const raisedEth = parseFloat(ethers.formatEther(raisedWei));

          const goalMnt = Math.floor(goalEth * ETH_TO_MNT_RATE);
          const raisedMnt = Math.floor(raisedEth * ETH_TO_MNT_RATE);

          return {
            id: Number(c[0]),
            owner: c[1],
            title: c[2],
            primaryCategory: c[3],
            description: c[4],
            goalWei,
            raisedWei,
            goalMnt,
            raisedMnt,
            isActive: c[7],
            imageUrl: c[8] || '/placeholder.png',
            metadataHash: c[9] || '',
          };
        });

        setCampaigns(parsedCampaigns);
      } catch (err) {
        console.error(err);
        setError(
          'Кампанит ажлуудыг татахад алдаа гарлаа: ' + (err as Error).message
        );
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // 3) Хайлт + Фильтр
  const filteredCampaigns = campaigns.filter((camp) => {
    // (A) Хайлт
    const matchSearch =
      camp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      camp.description.toLowerCase().includes(searchTerm.toLowerCase());

    // (B) primaryCategory ашиглан шүүх (e.g. "хандив" эсвэл "хөрөнгө оруулалт")
    // Жишээ нь гэрээнд "Хандив" гэж хадгалсан бол доор "хандив"‐д toLowerCase тааруулна
    const matchFilter =
      filterType === ''
        ? true
        : camp.primaryCategory.toLowerCase() === filterType.toLowerCase();

    return matchSearch && matchFilter;
  });

  return (
    <div className='container mx-auto px-4 py-8 bg-white'>
      <div className='mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
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

      {/* Алдаа гарвал Alert харуулах */}
      {error && (
        <Alert
          variant='destructive'
          className='bg-red-600 text-white p-4 rounded-lg mb-4'
        >
          <AlertTitle>⚠️ Алдаа гарлаа</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Хайлт & Фильтр */}
      <div className='mb-6 flex flex-col sm:flex-row gap-4 items-center'>
        {/* Хайлт талбар */}
        <div className='flex items-center bg-gray-100 rounded px-2 w-full sm:max-w-sm'>
          <Search className='text-gray-500 w-5 h-5' />
          <input
            type='text'
            className='bg-transparent px-2 py-2 w-full focus:outline-none'
            placeholder='Хайх (нэр, тайлбар)'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <XCircle
              className='text-gray-400 w-5 h-5 cursor-pointer hover:text-gray-600'
              onClick={() => setSearchTerm('')}
            />
          )}
        </div>

        {/* Filter (Хандив, Хөрөнгө оруулалт) */}
        <div className='relative'>
          <Filter className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5' />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className='pl-9 pr-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
          >
            <option value=''>Төрлөөр шүүх</option>
            <option value='хандив'>Хандив</option>
            <option value='хөрөнгө оруулалт'>Хөрөнгө оруулалт</option>
          </select>
        </div>
      </div>

      {loading ? (
        // Loading skeleton
        <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className='h-64 w-full rounded-md bg-gray-300' />
          ))}
        </div>
      ) : (
        // Бодит Campaign Card‐ууд
        <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
          {filteredCampaigns.map((camp) => (
            <CampaignCard
              key={camp.id}
              campaign={camp}
              currentUser={currentUser}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ----------------- CampaignCard -----------------
function CampaignCard({
  campaign,
  currentUser,
}: {
  campaign: Campaign;
  currentUser: string | null;
}) {
  // Дэвшил % (MNT)
  const progress =
    campaign.goalMnt > 0
      ? Math.min((campaign.raisedMnt / campaign.goalMnt) * 100, 100).toFixed(0)
      : '0';

  // Эзэмшигч мөн эсэх
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
        {/* primaryCategory‐г илүү тод харуулах жишээ */}
        <p className='text-sm text-gray-600 mb-1'>
          <strong className='text-blue-600'>{campaign.primaryCategory}</strong>
        </p>

        <p className='text-gray-900 mb-2'>{campaign.description}</p>

        <Progress value={parseFloat(progress)} className='my-3 bg-gray-300' />
        <div className='mb-3 flex justify-between text-sm text-gray-900'>
          <span>
            Зорилго:{' '}
            <strong className='text-blue-600'>
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
