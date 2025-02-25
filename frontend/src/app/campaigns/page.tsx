'use client';

import { useState, useEffect } from 'react';
import { ethers, JsonRpcProvider } from 'ethers';
import { getFundraisingContract } from '../../services/contractConfig'; // Adjust path if needed
import React from 'react';

interface Campaign {
  id: number;
  owner: string;
  title: string;
  description: string;
  goal: number;
  raised: number;
  isActive: boolean;
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);

  useEffect(() => {
    const provider = new JsonRpcProvider('http://127.0.0.1:8545');
    const contract = getFundraisingContract(provider);

    async function fetchData() {
      const data = await contract.getAllCampaigns();
      const parsed = data.map((c: any) => ({
        id: Number(c[0]), // BigInt -> number
        owner: c[1],
        title: c[2],
        description: c[3],
        goal: Number(c[4]), // BigInt -> number
        raised: Number(c[5]),
        isActive: c[6],
      }));
      setCampaigns(parsed);
    }
    fetchData();
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

// Sub-component for each campaign card
function CampaignCard({ campaign }: { campaign: Campaign }) {
  const progress = Math.min(
    (campaign.raised / campaign.goal) * 100,
    100
  ).toFixed(0);

  return (
    <div className='rounded-lg border bg-white p-4 shadow-sm hover:shadow-md transition-shadow'>
      {/* If you store images on-chain or off-chain, adapt accordingly */}
      {/* <img src="/campaign1.jpg" alt={campaign.title} className="mb-3 h-40 w-full object-cover rounded" /> */}

      <h2 className='mb-2 text-lg font-semibold text-gray-800'>
        {campaign.title}
      </h2>
      <p className='text-sm text-gray-600'>{campaign.description}</p>

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

      <a
        href={`/campaigns/${campaign.id}`}
        className='block rounded bg-blue-600 px-4 py-2 text-center text-white hover:bg-blue-500'
      >
        Дэлгэрэнгүй
      </a>
    </div>
  );
}
