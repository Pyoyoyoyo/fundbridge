'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BrowserProvider, ethers } from 'ethers';
import { motion } from 'framer-motion';

import { getMarketplaceContract } from '@/services/marketplaceConfig';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, ShoppingCart } from 'lucide-react';

// Жишээ ханш: 1 ETH = 6,000,000 MNT
const ETH_TO_MNT_RATE = 6_000_000;

interface MarketplaceItem {
  id: number;
  seller: string;
  buyer: string;
  title: string;
  description: string;
  price: string; // Wei хэлбэрийн дүнг string болгож авсан
  imageUrl: string;
  campaignId: number;
  isSold: boolean;
  isActive: boolean;
}

export default function MarketplaceBuyPage() {
  const { id } = useParams();
  const router = useRouter();

  const [item, setItem] = useState<MarketplaceItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchItem() {
      try {
        setLoading(true);

        if (!(window as any)?.ethereum) {
          setError('MetaMask not found!');
          return;
        }

        const itemId = Number(id);
        if (isNaN(itemId) || itemId <= 0) {
          setError('Invalid item ID parameter.');
          return;
        }

        const provider = new BrowserProvider((window as any).ethereum);
        await provider.send('eth_requestAccounts', []);
        const signer = await provider.getSigner();
        const contract = getMarketplaceContract(signer);

        const raw = await contract.getItem(itemId);
        // raw = [id, seller, buyer, title, desc, price(wei), imageUrl, campaignId, isSold, isActive]
        const parsed: MarketplaceItem = {
          id: Number(raw[0]),
          seller: raw[1],
          buyer: raw[2],
          title: raw[3],
          description: raw[4],
          price: raw[5].toString(), // wei → string
          imageUrl: raw[6],
          campaignId: Number(raw[7]),
          isSold: raw[8],
          isActive: raw[9],
        };
        console.log('Fetched item:', parsed);
        setItem(parsed);
      } catch (err: any) {
        console.error('Failed to fetch item:', err);
        setError('Алдаа гарлаа: ' + err.message);
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchItem();
  }, [id]);

  async function handleBuy() {
    if (!item) return;
    if (item.id <= 0) {
      alert('Invalid item data. Cannot proceed with purchase.');
      return;
    }

    try {
      if (!(window as any)?.ethereum) {
        alert('MetaMask not found!');
        return;
      }

      const provider = new BrowserProvider((window as any).ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const contract = getMarketplaceContract(signer);

      // itemCount шалгах
      const currentCount = Number(await contract.itemCount());
      if (item.id > currentCount) {
        alert(`Invalid item ID. Current total items: ${currentCount}`);
        return;
      }

      // price = wei (string)
      const msgValueWei = BigInt(item.price);
      console.log(
        'Attempting to buy item:',
        item.id,
        'value:',
        msgValueWei.toString()
      );

      const tx = await contract.buyItem(item.id, { value: msgValueWei });
      await tx.wait();

      alert('Амжилттай худалдаж авлаа!');
      router.push('/marketplace');
    } catch (err: any) {
      console.error('Buy error:', err);
      alert('Алдаа гарлаа: ' + err.message);
    }
  }

  if (loading) {
    return (
      <div className='min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-blue-50'>
        <Skeleton className='h-40 w-3/4 rounded-md bg-gray-300 animate-pulse' />
        <p className='text-gray-500 mt-2'>Ачааллаж байна...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className='m-4'>
        <Alert variant='destructive'>
          <div className='flex items-center gap-2 text-red-600'>
            <AlertCircle className='w-5 h-5' />
            <AlertTitle>Алдаа</AlertTitle>
          </div>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!item) {
    return (
      <div className='m-4'>
        <Alert variant='destructive'>
          <div className='flex items-center gap-2 text-red-600'>
            <AlertCircle className='w-5 h-5' />
            <AlertTitle>Алдаа</AlertTitle>
          </div>
          <AlertDescription>Item олдсонгүй.</AlertDescription>
        </Alert>
      </div>
    );
  }

  // -------------- View-д үзүүлэх дүнг тооцоолох --------------
  // 1) Wei → ETH (string)
  const approximateEthString = ethers.formatEther(BigInt(item.price));
  // 2) string → float
  const approximateEthNum = parseFloat(approximateEthString);
  // 3) MNT‐рүү хөрвүүл
  const approximateMNT = Math.floor(approximateEthNum * ETH_TO_MNT_RATE);

  return (
    <motion.div
      className='min-h-screen bg-gradient-to-b from-white to-blue-50 p-8 flex flex-col items-center'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className='w-full max-w-3xl'
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <Card className='bg-white shadow-lg hover:shadow-2xl transition-all rounded-lg overflow-hidden'>
          <CardHeader className='bg-blue-100 text-blue-600 p-4 flex items-center gap-2'>
            <ShoppingCart className='w-5 h-5' />
            <CardTitle className='text-2xl font-bold'>
              {item.title} — Худалдаж авах
            </CardTitle>
          </CardHeader>

          <CardContent className='p-4 flex flex-col gap-4'>
            <p className='text-gray-800'>{item.description}</p>

            {item.imageUrl && (
              <motion.div
                className='overflow-hidden rounded-lg mt-2'
                whileHover={{ scale: 1.02 }}
              >
                <img
                  src={item.imageUrl}
                  alt='Item'
                  className='w-full h-auto object-cover transition-transform duration-300 hover:scale-105'
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      '/images/no-image.png';
                  }}
                />
              </motion.div>
            )}

            <div className='text-gray-800 mt-2 space-y-1'>
              <p>
                Үнэ (MNT, ойролцоогоор):{' '}
                <strong className='text-blue-600'>
                  {approximateMNT.toLocaleString()} MNT
                </strong>
              </p>
              <p className='text-xs text-gray-500'>
                Үнэ (ETH):{' '}
                <strong className='text-blue-600'>
                  {approximateEthNum.toFixed(6)} ETH
                </strong>
              </p>
            </div>

            {item.isSold ? (
              <p className='text-red-600 font-medium'>
                Энэ item аль хэдийн зарагдсан байна!
              </p>
            ) : !item.isActive ? (
              <p className='text-red-600 font-medium'>
                Энэ item идэвхгүй байна!
              </p>
            ) : (
              <Button
                className='bg-blue-600 hover:bg-blue-500 text-white w-full py-2'
                onClick={handleBuy}
              >
                Худалдаж авах
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
