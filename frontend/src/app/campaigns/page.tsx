'use client';

import { useEffect, useState } from 'react';
import { BrowserProvider, ethers } from 'ethers';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Search, Filter, XCircle } from 'lucide-react';
import { Campaign } from '@/app/interfaces/campaign/campaignData';
import { CampaignCard } from '@/components/campaigns/CampaignCard';
import { getFundraisingContract } from '@/services/fundraisingConfig';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';

const ETH_TO_MNT_RATE = 6_000_000;

function computeStatus(c: Campaign): string {
  if (!c.isActive) {
    return c.raisedWei >= c.goalWei
      ? 'Хугацаа дууссан (Амжилттай)'
      : 'Хугацаа дууссан (Амжилтгүй)';
  }
  return c.raisedWei === BigInt(0) ? 'Шинээр үүссэн' : 'Хэрэгжиж байгаа';
}

export default function CampaignsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // 1) Detect & log MetaMask account
  useEffect(() => {
    async function detectUser() {
      if ((window as any)?.ethereum) {
        const provider = new BrowserProvider((window as any).ethereum);
        const accounts = await provider.send('eth_requestAccounts', []);
        console.log('🔑 MetaMask account:', accounts[0]);
        setCurrentUser(accounts[0]);
      }
    }
    detectUser();

    // listen for account changes
    if ((window as any)?.ethereum?.on) {
      (window as any).ethereum.on('accountsChanged', (accounts: string[]) => {
        console.log('🔄 Accounts changed:', accounts);
        setCurrentUser(accounts[0] || null);
      });
    }

    return () => {
      if ((window as any)?.ethereum?.removeListener) {
        (window as any).ethereum.removeListener(
          'accountsChanged',
          (accounts: string[]) => setCurrentUser(accounts[0] || null)
        );
      }
    };
  }, [session]);

  // 2) Fetch campaigns and log raw owner
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        let provider: ethers.BrowserProvider | ethers.JsonRpcProvider;
        if ((window as any)?.ethereum) {
          provider = new BrowserProvider((window as any).ethereum);
          await provider.send('eth_requestAccounts', []);
        } else {
          provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
        }

        const contract = getFundraisingContract(provider);
        const allCampaigns = await contract.getAllCampaigns();

        const parsedCampaigns: Campaign[] = allCampaigns.map((c: any) => {
          console.log('🏷️ contract owner raw:', c[1]);
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
      } catch (err: any) {
        console.error(err);
        setError('Кампанит ажлуудыг татахад алдаа гарлаа: ' + err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // 3) Filter & group campaigns (unchanged)
  const filteredCampaigns = campaigns.filter((camp) => {
    const matchSearch =
      camp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      camp.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter =
      filterType === '' ||
      camp.primaryCategory.toLowerCase() === filterType.toLowerCase();
    const campaignStatus = computeStatus(camp);
    const matchStatus =
      statusFilter === '' ||
      campaignStatus.toLowerCase() === statusFilter.toLowerCase();

    return matchSearch && matchFilter && matchStatus;
  });

  const statusGroups: { [key: string]: Campaign[] } = {
    'Шинээр үүссэн': [],
    'Хэрэгжиж байгаа': [],
    'Хугацаа дууссан (Амжилттай)': [],
    'Хугацаа дууссан (Амжилтгүй)': [],
  };
  filteredCampaigns.forEach((camp) => {
    const st = computeStatus(camp);
    (statusGroups[st] ||= []).push(camp);
  });

  // Create campaign handler (unchanged)
  const handleCreateCampaign = async () => {
    try {
      const res = await fetch('/api/user/kyc-status');
      const data = await res.json();
      if (data.kycVerified) router.push('/campaigns/create');
      else router.push('/kyc');
    } catch {
      router.push('/login');
    }
  };

  return (
    <div className='container mx-auto px-4 py-8 bg-white'>
      <div className='mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <h1 className='text-3xl font-bold text-blue-600'>
          Бүх кампанит ажлууд
        </h1>
        <Button
          onClick={handleCreateCampaign}
          className='bg-blue-600 hover:bg-blue-500 text-white'
        >
          Кампанит ажил үүсгэх
        </Button>
      </div>

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
        <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className='h-64 w-full rounded-md bg-gray-300' />
          ))}
        </div>
      ) : (
        // Grouped display: For each status group, if non-empty, render a header and grid row
        Object.entries(statusGroups).map(([groupStatus, groupCampaigns]) => {
          if (groupCampaigns.length === 0) return null;
          return (
            <div key={groupStatus} className='mb-8'>
              <h2 className='text-2xl font-semibold text-gray-800 mb-4'>
                {groupStatus}
              </h2>
              <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
                {groupCampaigns.map((camp) => (
                  <CampaignCard
                    key={camp.id}
                    campaign={camp}
                    currentUser={currentUser}
                  />
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
