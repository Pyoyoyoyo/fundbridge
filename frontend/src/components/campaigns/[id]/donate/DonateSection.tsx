'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { BrowserProvider, ethers } from 'ethers';
import { Button } from '@/components/ui/button';
import { TabButton } from '@/components/SharedComponents/TabButton';
import { getFundraisingContract } from '@/services/fundraisingConfig';
import { useRouter } from 'next/navigation';

// QPay‐тэй холбогдох төлбөрийн талбарууд
interface QPayFormData {
  phone: string; // хэрэглэгчийн утас
  amountMnt: string;
}

export default function DonateSection({ campaignId }: { campaignId: number }) {
  const router = useRouter();
  const [activeMethod, setActiveMethod] = useState<
    'fiat' | 'eth' | 'card' | 'qpay'
  >('eth');
  const [donating, setDonating] = useState(false);

  // ------------------- QPay -------------------
  const [qpayData, setQpayData] = useState<QPayFormData>({
    phone: '',
    amountMnt: '',
  });
  async function handleQPayDonate() {
    try {
      setDonating(true);
      const res = await fetch('/api/payment/qpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId,
          phone: qpayData.phone,
          amountMnt: qpayData.amountMnt,
        }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'QPay төлбөр алдаа');
      }
      const data = await res.json();
      alert(`QPay invoice үүслээ. QR code: ${data.qrImageUrl}`);
      // QPay app дээр төлбөр хийсний дараа, webhook/poll ашиглан donate(...) дуудна.
    } catch (err: any) {
      alert('QPay payment error: ' + err.message);
    } finally {
      setDonating(false);
    }
  }

  // ------------------- FIAT -------------------
  const [fiatAmountMnt, setFiatAmountMnt] = useState('');
  async function handleDonateFiat() {
    try {
      setDonating(true);
      const res = await fetch('/api/payment/fiat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId, amountMnt: fiatAmountMnt }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'FIAT payment failed');
      }
      alert(`FIAT төлбөр амжилттай. Дүн: ${fiatAmountMnt} MNT`);

      // Төлбөр амжилттай болсон гэж үзвэл FundraisingContract => donate(...) дуудаж болно
      // (msg.value=0, comment="Paid by bank" гэх мэт)
    } catch (err: any) {
      alert('FIAT payment error: ' + err.message);
    } finally {
      setDonating(false);
    }
  }

  // ------------------- CARD -------------------
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  async function handleDonateCard() {
    try {
      setDonating(true);
      // 1) Энд Stripe‐ийн PaymentIntent‐ийг create => confirm => амжилттай бол
      // 2) FundraisingContract => donate(...) (msg.value=0, comment="Paid by card")
      alert(`Картаар төлбөр илгээх (fake demo). Number: ${cardNumber}`);
      // ...
    } catch (err: any) {
      alert('Card payment error: ' + err.message);
    } finally {
      setDonating(false);
    }
  }

  // ------------------- ETH -------------------
  const [amountEth, setAmountEth] = useState('');
  const [comment, setComment] = useState('');
  async function handleEthDonate() {
    try {
      setDonating(true);
      if (!window.ethereum) {
        alert('MetaMask not found!');
        return;
      }
      const provider = new BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const contract = getFundraisingContract(signer);

      // parse Ether string -> wei
      const donationWei = ethers.parseEther(amountEth || '0');

      // donate(_campaignId, _comment) payable
      const tx = await contract.donate(campaignId, comment, {
        value: donationWei,
      });
      await tx.wait();
      alert('ETH donate амжилттай!');
      router.push(`/campaigns/${campaignId}`);
    } catch (err: any) {
      alert('ETH donate error: ' + err.message);
    } finally {
      setDonating(false);
    }
  }

  // ------------------- Tab Render -------------------
  function renderTabContent() {
    switch (activeMethod) {
      case 'fiat':
        return (
          <div className='p-4 border border-gray-200 rounded space-y-2'>
            <label className='text-sm text-gray-600'>Хандивын дүн (MNT)</label>
            <input
              type='number'
              step='1'
              min='0'
              value={fiatAmountMnt}
              onChange={(e) => setFiatAmountMnt(e.target.value)}
              className='border border-gray-300 rounded px-3 py-2 w-full'
              placeholder='10000'
              disabled={donating}
            />
            <Button
              onClick={handleDonateFiat}
              disabled={donating}
              className='bg-blue-600 text-white w-full'
            >
              {donating ? 'Илгээж байна...' : 'FIAT-аар хандив өгөх'}
            </Button>
          </div>
        );
      case 'card':
        return (
          <div className='p-4 border border-gray-200 rounded space-y-2'>
            <label className='text-sm text-gray-600'>Картын дугаар</label>
            <input
              type='text'
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              className='border border-gray-300 rounded px-3 py-2 w-full'
              placeholder='XXXX-XXXX-XXXX-XXXX'
              disabled={donating}
            />
            <label className='text-sm text-gray-600'>
              Карт эзэмшигчийн нэр
            </label>
            <input
              type='text'
              value={cardHolder}
              onChange={(e) => setCardHolder(e.target.value)}
              className='border border-gray-300 rounded px-3 py-2 w-full'
              placeholder='John Doe'
              disabled={donating}
            />
            <label className='text-sm text-gray-600'>Дуусах огноо</label>
            <input
              type='text'
              value={cardExpiry}
              onChange={(e) => setCardExpiry(e.target.value)}
              className='border border-gray-300 rounded px-3 py-2 w-full'
              placeholder='MM/YY'
              disabled={donating}
            />
            <Button
              onClick={handleDonateCard}
              disabled={donating}
              className='bg-blue-600 text-white w-full mt-3'
            >
              {donating ? 'Илгээж байна...' : 'Картаар төлбөр хийх'}
            </Button>
          </div>
        );
      case 'qpay':
        return (
          <div className='p-4 border border-gray-200 rounded space-y-2'>
            <label className='text-sm text-gray-600'>Утасны дугаар</label>
            <input
              type='text'
              value={qpayData.phone}
              onChange={(e) =>
                setQpayData((prev) => ({ ...prev, phone: e.target.value }))
              }
              className='border border-gray-300 rounded px-3 py-2 w-full'
              placeholder='99998888'
              disabled={donating}
            />
            <label className='text-sm text-gray-600'>Хандивын дүн (MNT)</label>
            <input
              type='number'
              step='1'
              min='0'
              value={qpayData.amountMnt}
              onChange={(e) =>
                setQpayData((prev) => ({ ...prev, amountMnt: e.target.value }))
              }
              className='border border-gray-300 rounded px-3 py-2 w-full'
              placeholder='10000'
              disabled={donating}
            />
            <Button
              onClick={handleQPayDonate}
              disabled={donating}
              className='bg-blue-600 text-white w-full'
            >
              {donating ? 'Илгээж байна...' : 'QPay-р төлбөр хийх'}
            </Button>
          </div>
        );
      case 'eth':
      default:
        return (
          <div className='space-y-4 p-4 border border-gray-200 rounded'>
            <div>
              <label className='text-sm font-medium text-gray-600'>
                ETH дүн
              </label>
              <input
                type='number'
                step='0.0001'
                min='0'
                value={amountEth}
                onChange={(e) => setAmountEth(e.target.value)}
                className='border border-gray-300 rounded px-3 py-2 w-full'
                placeholder='e.g. 0.01'
                disabled={donating}
              />
            </div>
            <div>
              <label className='text-sm font-medium text-gray-600'>
                Коммент
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className='border border-gray-300 rounded px-3 py-2 w-full'
                placeholder='Сайн үйлсийг дэмжлээ!'
                disabled={donating}
              />
            </div>
            <Button
              onClick={handleEthDonate}
              disabled={donating}
              className='bg-blue-600 text-white w-full'
            >
              {donating ? 'Илгээж байна...' : 'Donate with ETH'}
            </Button>
          </div>
        );
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
      {/* Tab сонголтууд */}
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
        <TabButton
          label='QPay'
          isActive={activeMethod === 'qpay'}
          onClick={() => setActiveMethod('qpay')}
        />
      </div>
      {renderTabContent()}
    </motion.div>
  );
}
