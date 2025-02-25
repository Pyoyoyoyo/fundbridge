'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

// A minimal mock campaign data structure
interface Campaign {
  id: string;
  title: string;
  description: string;
  goal: number;
  raised: number;
  image?: string; // optional campaign image
}

export default function CampaignsPage() {
  // For demonstration, we’ll store campaigns in state
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  // In a real app, fetch from your backend or blockchain
  useEffect(() => {
    // Example: Hard-coded mock data
    const mockCampaigns: Campaign[] = [
      {
        id: '1',
        title: 'Clean Water Project',
        description: 'Bringing clean water to rural areas.',
        goal: 1000,
        raised: 350,
        image: '/campaign1.png',
      },
      {
        id: '2',
        title: 'Solar Village',
        description: 'Providing solar energy solutions.',
        goal: 2000,
        raised: 1800,
        image: '/campaign2.jpg',
      },
      {
        id: '3',
        title: 'Education for All',
        description: 'Support underprivileged students.',
        goal: 1500,
        raised: 400,
        image: '/campaign3.jpg',
      },
    ];
    setCampaigns(mockCampaigns);
  }, []);

  return (
    <div className='container mx-auto px-4 py-8'>
      <h1 className='mb-4 text-2xl font-semibold text-gray-800 sm:text-3xl'>
        Бүх кампанит ажлууд
      </h1>
      <p className='mb-8 text-gray-600'>
        Энд FundBridge дээр үүссэн бүх идэвхтэй кампанит ажлуудын жагсаалт
        харагдана. Та хүссэн төслөө дэмжиж, хөрөнгө оруулалт хийж болно.
      </p>

      <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
        {campaigns.map((campaign) => (
          <CampaignCard key={campaign.id} campaign={campaign} />
        ))}
      </div>
    </div>
  );
}

// A sub-component to display each campaign in a card
function CampaignCard({ campaign }: { campaign: Campaign }) {
  const progress = Math.min(
    (campaign.raised / campaign.goal) * 100,
    100
  ).toFixed(0);

  return (
    <div className='rounded-lg border bg-white p-4 shadow-sm hover:shadow-md transition-shadow'>
      {/* Optional campaign image */}
      {campaign.image && (
        <img
          src={campaign.image}
          alt={campaign.title}
          className='mb-3 h-40 w-full object-cover rounded'
        />
      )}

      <h2 className='mb-2 text-lg font-semibold text-gray-800'>
        {campaign.title}
      </h2>
      <p className='text-sm text-gray-600'>{campaign.description}</p>

      <div className='my-3 h-2 w-full rounded bg-gray-200'>
        {/* progress bar */}
        <div
          className='h-full rounded bg-blue-600'
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <div className='mb-3 flex justify-between text-sm text-gray-600'>
        <span>
          Зорилго: <strong>{campaign.goal} MNT</strong>
        </span>
        <span>
          Цугласан: <strong>{campaign.raised} MNT</strong>
        </span>
      </div>

      <Link
        href={`/campaigns/${campaign.id}`}
        className='block rounded bg-blue-600 px-4 py-2 text-center text-white hover:bg-blue-500'
      >
        Дэлгэрэнгүй
      </Link>
    </div>
  );
}
