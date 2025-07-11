'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ethers, BrowserProvider } from 'ethers';

// Та ашиглах UI компонентийн импортууд
import { Button } from '@/components/ui/button';
import { TabButton } from '@/components/SharedComponents/TabButton';
import { FiatForm } from '@/components/marketplace/[id]/PurchaseForms/FiatForm';
import CardForm from '@/components/campaigns/[id]/donate/DonateForms/CardForm';
import { getMarketplaceContract } from '@/services/marketplaceConfig';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

/**
 * PaymentTabs – ETH, Fiat, Card, QPay гэсэн 4 сонголттой таб
 * itemId, price, approximateMNT гэх мэт тусдаа параметрээр дамжуулна.
 */
export default function PaymentTabs({
  itemId,
  price,
  approximateMNT,
}: {
  itemId: number; // Item-ын ID
  price: string; // Wei хэлбэртэй үнэ
  approximateMNT: number; // UI‐д харуулах зорилгоор (жишээ)
}) {
  const [activeMethod, setActiveMethod] = useState<
    'fiat' | 'eth' | 'card' | 'qpay'
  >('eth');
  const [donating, setDonating] = useState(false);

  // --------------------------------------------------------
  // Тухайн табын контент
  // --------------------------------------------------------
  function renderTabContent() {
    switch (activeMethod) {
      case 'fiat':
        return (
          <div className='p-4 bg-white border border-gray-200 rounded space-y-4'>
            <p className='text-sm text-gray-600'>
              Та MNT (төгрөг)‐өөр дэмжих бол энд дүнгээ оруулаад шилжүүлнэ үү.
            </p>
            <FiatForm />
          </div>
        );
      case 'card':
        return (
          <div className='p-4 bg-white border border-gray-200 rounded space-y-4'>
            <p className='text-sm text-gray-600'>
              Та картын мэдээллээ оруулж, Stripe төлбөрийг илгээнэ.
            </p>
            <CardForm
              amountMnt={approximateMNT}
              onSuccess={() => alert('Картаар амжилттай төллөө!')}
            />
          </div>
        );
      case 'eth':
      default:
        return <EthBuyTabContent itemId={itemId} price={price} />;
    }
  }

  return (
    <motion.div
      className='bg-white p-4 rounded shadow space-y-4'
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
    >
      <div className='flex gap-2'>
        <TabButton
          label='Fiat'
          isActive={activeMethod === 'fiat'}
          onClick={() => setActiveMethod('fiat')}
        />
        <TabButton
          label='ETH'
          isActive={activeMethod === 'eth'}
          onClick={() => setActiveMethod('eth')}
        />
        <TabButton
          label='Card'
          isActive={activeMethod === 'card'}
          onClick={() => setActiveMethod('card')}
        />
      </div>

      {renderTabContent()}
    </motion.div>
  );
}

/**
 * EthBuyTabContent: itemId, price‐ийг авч buyItem(itemId, {value: price}) дуудах
 * + хэрэглэгчээс comment авч, (ОДООГИЙН ГЭРЭЭНД БАЙХГҮЙ) future-д дамжуулж болно.
 */
function EthBuyTabContent({
  itemId,
  price,
}: {
  itemId: number;
  price: string; // wei
}) {
  const router = useRouter();
  const { data: session } = useSession();

  const [loading, setLoading] = useState(false);
  const [comment, setComment] = useState(''); // хэрэглэгчээс авах comment

  async function handleBuyWithETH() {
    try {
      setLoading(true);
      if (!window.ethereum) {
        alert('MetaMask not found!');
        return;
      }
      // 1) Metamask provider
      const provider = new BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();

      // 2) getMarketplaceContract
      const contract = getMarketplaceContract(signer);

      // 3) buyItem(itemId) дуудахад, value = price (wei)
      // Хэрэв comment-ыг contract руу дамжуулах бол buyItemWithComment(...) зэрэг
      // функц хэрэгтэй гэдгийг анхаар.
      const tx = await contract.buyItem(itemId, {
        value: price,
      });
      await tx.wait();

      alert(
        `ETH төлбөр амжилттай! (Comment: "${comment}") \nFundraising руу мөнгө шилжлээ.`
      );
      router.push('/marketplace');
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
        Энэ барааны үнэ: {ethers.formatEther(price)} ETH
      </p>

      {/* Comment талбар */}
      <label className='block text-sm text-gray-600'>Comment (optional):</label>
      <textarea
        className='border border-gray-300 rounded px-3 py-2 w-full'
        placeholder='Та хүссэн мессэжээ бичнэ үү'
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        disabled={loading}
      />

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
