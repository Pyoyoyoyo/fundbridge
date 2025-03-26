import { useState } from 'react';
import { BrowserProvider, ethers } from 'ethers';
import { Button } from '@/components/ui/button';
import { getMarketplaceContract } from '@/services/marketplaceConfig';
import { MarketplaceItem } from '@/app/interfaces';

function EthForm({ item }: { item: MarketplaceItem }) {
  const [loading, setLoading] = useState(false);

  async function handleBuyWithETH() {
    try {
      setLoading(true);
      if (!window.ethereum) {
        alert('MetaMask not found!');
        return;
      }
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const contract = getMarketplaceContract(signer);

      // item.price нь аль хэдийн wei хэлбэртэй гэж үзье
      const tx = await contract.buyItem(item.id, {
        value: item.price,
      });
      await tx.wait();

      alert('ETH төлбөр амжилттай! Fundraising руу мөнгө шилжлээ.');
    } catch (err: any) {
      console.error(err);
      alert('ETH buy error: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='border p-4 rounded space-y-3 bg-white'>
      <p className='text-sm text-gray-600'>
        Энэ барааны үнэ: {ethers.formatEther(item.price)} ETH
        <br />
      </p>
      <Button
        onClick={handleBuyWithETH}
        disabled={loading}
        className='bg-blue-600 text-white w-full'
      >
        {loading ? 'Илгээж байна...' : 'ETH‐ээр худалдан авах'}
      </Button>
    </div>
  );
}
