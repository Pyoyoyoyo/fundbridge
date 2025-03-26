// components/PaymentTabs.tsx
'use client';

import { useState } from 'react';
import { BrowserProvider, ethers } from 'ethers';
import { Button } from '@/components/ui/button';
import { TabButton } from '@/components/ui/TabButton';
import { getMarketplaceContract } from '@/services/marketplaceConfig';

const ETH_TO_MNT_RATE = 6000000;

interface PaymentTabsProps {
  itemId: number;
  price: string;
}

export default function PaymentTabs({ itemId, price }: PaymentTabsProps) {
  const [activeTab, setActiveTab] = useState<'eth' | 'fiat' | 'card'>('eth');
  const [processing, setProcessing] = useState(false);

  // ETH утгыг форматлаж, ойролцоогоор MNT-д хөрвүүлэх
  const priceEthString = ethers.formatEther(price);
  const priceEthNum = parseFloat(priceEthString);
  const approximateMnt = Math.floor(priceEthNum * ETH_TO_MNT_RATE);

  async function handleBuyEth() {
    try {
      setProcessing(true);
      if (!window.ethereum) {
        alert('MetaMask олдсонгүй!');
        return;
      }
      const provider = new BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const contract = getMarketplaceContract(signer);
      const tx = await contract.purchaseItem(itemId, {
        value: price,
      });
      await tx.wait();
      alert('ETH-аар худалдан авалт амжилттай боллоо!');
    } catch (error: any) {
      alert('ETH-аар худалдан авахад алдаа гарлаа: ' + error.message);
    } finally {
      setProcessing(false);
    }
  }

  async function handleBuyFiat() {
    // FIAT төлбөрийн интеграцчилал хийх хэсэг (API дуудлага гэх мэт)
    alert('FIAT-аар худалдан авах үйлдлийг хэрэгжүүлэх шаардлагатай!');
  }

  async function handleBuyCard() {
    // CARD төлбөрийн интеграцчилал хийх хэсэг (Stripe, эсвэл өөр үйлчилгээ)
    alert('Картаар худалдан авах үйлдлийг хэрэгжүүлэх шаардлагатай!');
  }

  return (
    <div className='p-4 border border-gray-200 rounded space-y-4'>
      <h2 className='text-xl font-bold'>Худалдаж авах</h2>
      <div className='mb-4'>
        <p>
          Үнэ (MNT):{' '}
          <strong className='text-blue-600'>
            {approximateMnt.toLocaleString()} MNT
          </strong>
        </p>
        <p>
          Үнэ (ETH, ойролцоогоор):{' '}
          <strong className='text-blue-600'>
            {priceEthNum.toFixed(6)} ETH
          </strong>
        </p>
      </div>
      <div className='flex gap-2 mb-4'>
        <TabButton
          label='ETH'
          isActive={activeTab === 'eth'}
          onClick={() => setActiveTab('eth')}
        />
        <TabButton
          label='Fiat'
          isActive={activeTab === 'fiat'}
          onClick={() => setActiveTab('fiat')}
        />
        <TabButton
          label='Card'
          isActive={activeTab === 'card'}
          onClick={() => setActiveTab('card')}
        />
      </div>
      <div>
        {activeTab === 'eth' && (
          <Button
            onClick={handleBuyEth}
            disabled={processing}
            className='bg-blue-600 text-white w-full'
          >
            {processing ? 'Худалдаж байна...' : 'ETH-аар худалдан авах'}
          </Button>
        )}
        {activeTab === 'fiat' && (
          <Button
            onClick={handleBuyFiat}
            disabled={processing}
            className='bg-blue-600 text-white w-full'
          >
            {processing ? 'Худалдаж байна...' : 'FIAT-аар худалдан авах'}
          </Button>
        )}
        {activeTab === 'card' && (
          <Button
            onClick={handleBuyCard}
            disabled={processing}
            className='bg-blue-600 text-white w-full'
          >
            {processing ? 'Худалдаж байна...' : 'Картаар худалдан авах'}
          </Button>
        )}
      </div>
    </div>
  );
}
