// src/app/donate/page.tsx
'use client';

import { useState } from 'react';
import { ethers } from 'ethers';
import { getFundraisingContract } from '@/app/services/contractConfig';

export default function DonatePage() {
  const [campaignId, setCampaignId] = useState('');
  const [amountEth, setAmountEth] = useState('');

  const handleDonate = async () => {
    try {
      if (!(window as any).ethereum) {
        alert('MetaMask not found!');
        return;
      }
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();

      const contract = getFundraisingContract(signer);
      const value = ethers.parseEther(amountEth);
      const tx = await contract.donate(campaignId, { value });
      await tx.wait();

      alert('Donation successful!');
    } catch (err) {
      console.error(err);
      alert('Donation failed');
    }
  };

  return (
    <div className='max-w-md mx-auto bg-white rounded shadow p-6'>
      <h1 className='text-xl font-semibold mb-4'>Donate to Campaign</h1>
      <div className='mb-4'>
        <label className='block text-sm font-medium mb-1'>Campaign ID</label>
        <input
          className='w-full border border-gray-300 rounded px-3 py-2'
          value={campaignId}
          onChange={(e) => setCampaignId(e.target.value)}
        />
      </div>
      <div className='mb-4'>
        <label className='block text-sm font-medium mb-1'>Amount (ETH)</label>
        <input
          className='w-full border border-gray-300 rounded px-3 py-2'
          value={amountEth}
          onChange={(e) => setAmountEth(e.target.value)}
        />
      </div>
      <button
        onClick={handleDonate}
        className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500'
      >
        Donate
      </button>
    </div>
  );
}
