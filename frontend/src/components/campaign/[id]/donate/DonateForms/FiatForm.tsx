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
    <div>
      <label>Хандивын дүн (MNT)</label>
      <input
        type='number'
        value={donationAmountMnt}
        onChange={(e) => setDonationAmountMnt(e.target.value)}
      />
      <button onClick={handleDonateFiat} disabled={loading}>
        {loading ? 'Илгээж байна...' : 'Fiat-аар дэмжих'}
      </button>
    </div>
  );
}
