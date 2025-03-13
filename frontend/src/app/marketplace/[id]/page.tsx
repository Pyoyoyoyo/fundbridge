'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { BrowserProvider } from 'ethers';
import { getMarketplaceContract } from '@/services/marketplaceConfig';

interface MarketplaceItem {
  id: string;
  title: string;
  description: string;
  price: number; // MNT
  image?: string;
  campaignId?: number; // Аль кампанит ажилд хандив оруулахыг заана
}

export default function MarketplaceDetailPage() {
  const params = useParams() as { id: string };
  const [item, setItem] = useState<MarketplaceItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchItem() {
      try {
        if (!(window as any).ethereum) {
          console.warn('MetaMask not found!');
          setLoading(false);
          return;
        }
        const provider = new BrowserProvider((window as any).ethereum);
        await provider.send('eth_requestAccounts', []);
        const signer = await provider.getSigner();

        const contract = getMarketplaceContract(signer);
        const raw = await contract.getItem(params.id);
        const parsed: MarketplaceItem = {
          id: raw.id.toString(),
          title: raw.title,
          description: raw.description,
          price: Number(raw.price),
          image: raw.imageUrl,
          campaignId: Number(raw.campaignId),
        };
        setItem(parsed);
      } catch (err) {
        console.error('Failed to fetch item detail:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchItem();
  }, [params.id]);

  async function handleBuy() {
    if (!item) return;

    try {
      // 1) MetaMask connect
      if (!(window as any).ethereum) {
        alert('MetaMask not found!');
        return;
      }
      const provider = new BrowserProvider((window as any).ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const contract = getMarketplaceContract(signer);

      // 2) Худалдаж авах логик
      // price (MNT) → ETH рүү хөрвүүлж tx.value-д дамжуулна, эсвэл smart contract дотор MNT→wei хийх логик байж болно.
      // Та MNT болон ETH-ийн ханшийг тохируулж тооцоолох шаардлагатай (жишээ: 1ETH=6,000,000MNT).
      // Жишээ нь: price=120000 => 120000 MNT => 0.02 ETH орчим (mock)
      const ethPrice = item.price / 6_000_000; // MNT -> ETH (mock)
      const valueInWei = ethers.parseEther(ethPrice.toFixed(5));

      // buyItem(itemId) + value
      // Smart Contract дотор buyItem(...) дуудагдахад орлогыг сонгосон campaignId-д нэмж өгнө.
      console.log('Buying item with value(wei):', valueInWei.toString());
      // const tx = await contract.buyItem(item.id, { value: valueInWei });
      // await tx.wait();

      alert(
        'Худалдаж авлаа! Хандив campaignId=' + item.campaignId + ' руу орно.'
      );
    } catch (err) {
      console.error(err);
      alert('Алдаа гарлаа: ' + (err as Error).message);
    }
  }

  if (loading) {
    return <div className='p-4'>Loading...</div>;
  }

  if (!item) {
    return <div className='p-4'>Item олдсонгүй</div>;
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <h1 className='mb-4 text-2xl font-semibold text-gray-800 sm:text-3xl'>
        {item.title}
      </h1>
      {item.image && (
        <img
          src={item.image}
          alt={item.title}
          className='mb-4 h-64 w-full object-cover rounded'
        />
      )}
      <p className='mb-4 text-gray-600'>{item.description}</p>
      <p className='text-lg text-gray-700'>
        Үнэ: {item.price.toLocaleString()} MNT
      </p>
      {item.campaignId && (
        <p className='text-sm text-gray-500 mt-1'>
          Хандив очих кампанит ажил: <strong>{item.campaignId}</strong>
        </p>
      )}
      <button
        onClick={handleBuy}
        className='mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-500'
      >
        Худалдаж авах
      </button>
    </div>
  );
}
