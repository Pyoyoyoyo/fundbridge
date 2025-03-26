'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ethers } from 'ethers';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import { getFundraisingContract } from '@/services/fundraisingConfig';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Search, Filter, XCircle } from 'lucide-react';
import { Campaign } from '@/app/interfaces';
import { CampaignCard } from '@/components/campaign/CampaignCard';

// Жишээ ханш
const ETH_TO_MNT_RATE = 6_000_000;

// --------- ТӨЛӨВ ТООЦОХ ФУНКЦ ---------
function computeStatus(c: Campaign): string {
  // Хугацаа дууссан (isActive=false) эсвэл идэвхтэй (isActive=true)
  if (!c.isActive) {
    // raisedWei >= goalWei => амжилттай
    if (c.raisedWei >= c.goalWei) {
      return 'Хугацаа дууссан (Амжилттай)';
    } else {
      return 'Хугацаа дууссан (Амжилтгүй)';
    }
  } else {
    // isActive = true
    if (c.raisedWei === BigInt(0)) {
      return 'Шинээр үүссэн';
    } else {
      return 'Хэрэгжиж байгаа';
    }
  }
}

export default function CampaignsPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Хайлт & Фильтрийн state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState(''); // 'хандив', 'хөрөнгө оруулалт', эсвэл ''
  const [statusFilter, setStatusFilter] = useState(''); // 'Шинээр үүссэн', 'Хэрэгжиж байгаа', 'Хугацаа дууссан (Амжилттай)', 'Хугацаа дууссан (Амжилтгүй)' эсвэл ''

  // 1) currentUser (Metamask address)
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
        const allCampaigns = await contract.getAllCampaigns();

        // Энэ жишээнд зөвхөн isActive=true кампанит ажлуудыг авна (хэрэв бүгдийг үзүүлэх бол энэ хэсгийг өөрчил)
        const activeOnes = allCampaigns.filter((c: any) => c.isActive);

        // parse
        const parsedCampaigns: Campaign[] = allCampaigns.map((c: any) => {
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

    // (B) Ангилал (primaryCategory) ашиглан шүүх
    const matchFilter =
      filterType === ''
        ? true
        : camp.primaryCategory.toLowerCase() === filterType.toLowerCase();

    // (C) Төлөв (statusFilter) ашиглан шүүх
    const campaignStatus = computeStatus(camp); // "Шинээр үүссэн", "Хэрэгжиж байгаа", "Хугацаа дууссан (Амжилттай)", "Хугацаа дууссан (Амжилтгүй)"
    const matchStatus =
      statusFilter === ''
        ? true
        : campaignStatus.toLowerCase() === statusFilter.toLowerCase();

    return matchSearch && matchFilter && matchStatus;
  });

  return (
    <div className='container mx-auto px-4 py-8 bg-white'>
      <div className='mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <h1 className='text-3xl font-bold text-blue-600'>
          Бүх кампанит ажлууд
        </h1>

        {/* createCampaign товч -- Link биш, Button хэлбэр */}
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

        {/* Төлөвөөр шүүх */}
        <div className='relative'>
          <Filter className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5' />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className='pl-9 pr-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
          >
            <option value=''>Төлөвөөр шүүх</option>
            <option value='Шинээр үүссэн'>Шинээр үүссэн</option>
            <option value='Хэрэгжиж байгаа'>Хэрэгжиж байгаа</option>
            <option value='Хугацаа дууссан (Амжилттай)'>
              Хугацаа дууссан (Амжилттай)
            </option>
            <option value='Хугацаа дууссан (Амжилтгүй)'>
              Хугацаа дууссан (Амжилтгүй)
            </option>
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
