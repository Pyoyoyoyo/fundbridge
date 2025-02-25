// src/app/create-campaign/page.tsx
'use client'; // UI эвент, useState, useEffect ашиглахад “use client” заавал

import { useState } from 'react';
import { ethers } from 'ethers';
import { getFundraisingContract } from '@/services/contractConfig';

export default function CreateCampaignPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [goal, setGoal] = useState('');

  const handleCreateCampaign = async () => {
    try {
      if (!(window as any).ethereum) {
        alert('MetaMask not found!');
        return;
      }
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();

      const contract = getFundraisingContract(signer);
      const tx = await contract.createCampaign(
        title,
        description,
        parseInt(goal)
      );
      await tx.wait();

      alert('Campaign created successfully!');
    } catch (err) {
      console.error(err);
      alert('Error creating campaign');
    }
  };

  return (
    <div className='max-w-md mx-auto bg-white rounded shadow p-6'>
      <h1 className='text-xl font-semibold mb-4'>Create Campaign</h1>
      <div className='mb-4'>
        <label className='block text-sm font-medium mb-1'>Title</label>
        <input
          className='w-full border border-gray-300 rounded px-3 py-2'
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className='mb-4'>
        <label className='block text-sm font-medium mb-1'>Description</label>
        <input
          className='w-full border border-gray-300 rounded px-3 py-2'
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className='mb-4'>
        <label className='block text-sm font-medium mb-1'>Goal (wei)</label>
        <input
          className='w-full border border-gray-300 rounded px-3 py-2'
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
        />
      </div>
      <button
        onClick={handleCreateCampaign}
        className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500'
      >
        Create
      </button>
    </div>
  );
}
