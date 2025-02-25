'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function CampaignDetailPage() {
  const { id } = useParams(); // get campaign id from URL
  const [campaign, setCampaign] = useState<any>(null);

  useEffect(() => {
    // fetch from blockchain or mock
    // e.g. setCampaign(mockCampaigns.find(c => c.id === id))
    // or call an API: fetch(`/api/campaigns/${id}`)
    // ...
    setCampaign({
      id,
      title: 'Clean Water Project',
      description: 'Bringing clean water to rural areas.',
      goal: 1000,
      raised: 350,
      image: '/campaign1.jpg',
    });
  }, [id]);

  if (!campaign) {
    return <div className='container mx-auto px-4 py-8'>Loading...</div>;
  }

  const progress = Math.min(
    (campaign.raised / campaign.goal) * 100,
    100
  ).toFixed(0);

  return (
    <div className='container mx-auto px-4 py-8'>
      <h1 className='mb-4 text-2xl font-semibold text-gray-800 sm:text-3xl'>
        {campaign.title}
      </h1>
      <img
        src={campaign.image}
        alt={campaign.title}
        className='mb-4 h-64 w-full object-cover rounded'
      />
      <p className='mb-4 text-gray-600'>{campaign.description}</p>

      <div className='my-3 h-2 w-full rounded bg-gray-200'>
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

      <button className='rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-500'>
        Хандив өгөх
      </button>
    </div>
  );
}
