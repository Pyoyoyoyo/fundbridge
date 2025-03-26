'use client';

import { useState, useEffect } from 'react';
import { BrowserProvider, ethers } from 'ethers';
import { getFundraisingContract } from '@/services/fundraisingConfig';

interface Donation {
  donor: string;
  amount: bigint;
  comment: string;
}

export default function CommentsTab({ campaignId }: { campaignId: number }) {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // getDonationHistory(_campaignId)‐г дуудаж, сэтгэгдлүүдээ татах
  useEffect(() => {
    async function loadDonations() {
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
        const result = await contract.getDonationsHistory(campaignId);
        // result[i] = [donor, amount, comment]

        const parsed = result.map((d: any) => ({
          donor: d.donor,
          amount: d.amount, // wei
          comment: d.comment,
        }));
        setDonations(parsed);
      } catch (err: any) {
        console.error('Failed to load donations:', err);
        setError('Донатын түүхийг татахад алдаа гарлаа: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
    if (campaignId) loadDonations();
  }, [campaignId]);

  return (
    <div className='bg-white p-4 rounded shadow'>
      <h3 className='text-xl font-semibold mb-4'>Сэтгэгдэл / Донатын түүх</h3>
      {error && <p className='text-red-500'>{error}</p>}
      {loading ? (
        <p>Ачааллаж байна...</p>
      ) : donations.length === 0 ? (
        <p>Одоогоор сэтгэгдэл (донат) алга байна.</p>
      ) : (
        <div className='space-y-4'>
          {donations.map((donation, i) => {
            const ethValue = parseFloat(ethers.formatEther(donation.amount));
            return (
              <div key={i} className='border border-gray-200 p-3 rounded'>
                <p className='text-sm text-gray-600'>
                  <strong>Хөрөнгө оруулагч:</strong> {donation.donor}
                </p>
                <p className='text-sm text-gray-600'>
                  <strong>Amount:</strong> {ethValue.toFixed(4)} ETH
                </p>
                <p className='text-gray-800 mt-1'>
                  <strong>Comment:</strong> {donation.comment}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
