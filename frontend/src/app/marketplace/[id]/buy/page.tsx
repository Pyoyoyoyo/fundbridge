'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BrowserProvider, ethers } from 'ethers';
import { getMarketplaceContract } from '@/services/marketplaceConfig';

interface MarketplaceItem {
  id: number;
  seller: string;
  buyer: string;
  title: string;
  description: string;
  price: bigint; // Wei
  imageUrl: string;
  campaignId: number;
  isSold: boolean;
  isActive: boolean;
}

export default function MarketplaceBuyPage() {
  const { id } = useParams();
  const router = useRouter();

  const [item, setItem] = useState<MarketplaceItem | null>(null);

  useEffect(() => {
    async function fetchItem() {
      const provider = new BrowserProvider((window as any).ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();

      const contract = getMarketplaceContract(signer);
      const raw = await contract.getItem(Number(id));
      // raw = [id, seller, buyer, title, desc, price (Wei), imageUrl, campaignId, isSold, isActive]

      setItem({
        id: Number(raw[0]),
        seller: raw[1],
        buyer: raw[2],
        title: raw[3],
        description: raw[4],
        price: raw[5], // BigInt (Wei)
        imageUrl: raw[6],
        campaignId: Number(raw[7]),
        isSold: raw[8],
        isActive: raw[9],
      });
    }
    if (id) fetchItem();
  }, [id]);

  async function handleBuy() {
    if (!item) return;
    const provider = new BrowserProvider((window as any).ethereum);
    await provider.send('eth_requestAccounts', []);
    const signer = await provider.getSigner();
    const contract = getMarketplaceContract(signer);

    // buyItem(_itemId) + msg.value = item.price (Wei)
    const tx = await contract.buyItem(item.id, {
      value: item.price, // BigInt
    });
    await tx.wait();

    alert('Амжилттай худалдаж авлаа!');
    router.push('/marketplace');
  }

  if (!item) return <p>Loading...</p>;

  // Хэрэглэгчдэд харуулахдаа Wei → ETH болгож үзүүлэх
  const priceEth = parseFloat(ethers.formatEther(item.price));

  return (
    <div>
      <h1>Buy {item.title}</h1>
      <p>Price (ETH): {priceEth}</p>
      <button onClick={handleBuy}>Buy</button>
    </div>
  );
}
