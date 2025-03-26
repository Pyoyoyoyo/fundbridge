'use client';

import { useEffect, useState } from 'react';

/**
 * Энгийн компонент:
 * - CoinGecko API руу хүсэлт илгээнэ
 * - Ханшийг татаж авмагц onRateUpdate(rate)‐г дуудаж, эцэг компонентдоо дамжуулна
 */
export default function EthRate({
  onRateUpdate,
}: {
  onRateUpdate: (rate: number) => void;
}) {
  const [rate, setRate] = useState<number>(6000000); // анхны fallback (1 ETH=6,000,000 MNT)
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRate() {
      try {
        setLoading(true);
        setError(null);
        // CoinGecko API
        const res = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=mnt'
        );
        if (!res.ok) {
          throw new Error('Failed to fetch ETH→MNT rate from CoinGecko');
        }
        const data = await res.json();
        // data?.ethereum?.mnt -> Жишээ: 5800000
        const newRate = data?.ethereum?.mnt || 6000000;
        setRate(newRate);

        // Эцэг компонентдоо ханшийг update хийж өгнө
        onRateUpdate(newRate);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchRate();
  }, [onRateUpdate]);

  if (loading) return <p>ETH ханш ачааллаж байна...</p>;
  if (error) return <p className='text-red-600'>Алдаа гарлаа: {error}</p>;

  // Ханш амжилттай авсан тохиолдолд UI‐д харуулах жишээ
  return (
    <div className='text-sm text-gray-600'>
      1 ETH ≈ {rate.toLocaleString()} MNT (real-time)
    </div>
  );
}
