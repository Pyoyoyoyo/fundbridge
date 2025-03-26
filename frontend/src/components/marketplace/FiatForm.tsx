'use client';

import { useState } from 'react';

export function FiatForm() {
  const [donationAmountMnt, setDonationAmountMnt] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleDonateFiat() {
    try {
      setLoading(true);
      const res = await fetch('/api/payment/fiat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: donationAmountMnt }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Fiat payment error');
      }
      alert('Fiat шилжүүлгийн мэдээлэл амжилттай илгээгдлээ!');
    } catch (err: any) {
      alert('Fiat алдаа: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='space-y-2'>
      <label className='text-sm text-gray-600'>Хандивын дүн (MNT)</label>
      <input
        type='number'
        value={donationAmountMnt}
        onChange={(e) => setDonationAmountMnt(e.target.value)}
        className='border border-gray-300 rounded px-3 py-2 w-full'
        placeholder='Жишээ нь 10000'
        disabled={loading}
      />
      <button
        onClick={handleDonateFiat}
        disabled={loading}
        className='bg-blue-600 text-white px-4 py-2 rounded w-full'
      >
        {loading ? 'Илгээж байна...' : 'Fiat-аар дэмжих'}
      </button>
    </div>
  );
}
