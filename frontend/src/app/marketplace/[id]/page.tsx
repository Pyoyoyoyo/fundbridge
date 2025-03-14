'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { BrowserProvider } from 'ethers';
import Link from 'next/link';
import { motion } from 'framer-motion';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Lucide icons жишээ
import { AlertTriangle, ImageIcon, BookOpen } from 'lucide-react';

// Marketplace гэрээний config
import { getMarketplaceContract } from '@/services/marketplaceConfig';

// Гэрээ MNT-ээр хадгалдаг гэж үзээд, 1 ETH = 6,000,000 MNT гэж үзье
const ETH_TO_MNT_RATE = 6_000_000;

// Хэрэв metadataHash ашиглаж IPFS JSON татах бол (жишээ fallback функц)
async function fetchMetadataWithFallback(cid: string) {
  const gateways = [
    `/api/pinataDownload?cid=${cid}`,
    `https://ipfs.io/ipfs/${cid}`,
    `https://gateway.pinata.cloud/ipfs/${cid}`,
  ];

  for (const url of gateways) {
    try {
      const resp = await fetch(url);
      if (!resp.ok) {
        throw new Error(`HTTP ${resp.status} - ${resp.statusText}`);
      }
      const data = await resp.json();
      return data;
    } catch (err) {
      console.warn(`Fetch failed from ${url}:`, err);
      // дараагийн gateway руу үргэлжлүүлнэ
    }
  }
  throw new Error('All IPFS gateway fetch attempts failed');
}

interface ItemMetadata {
  story?: string;
  extraImages?: string[];
}

interface MarketplaceItem {
  id: number;
  seller: string;
  buyer: string; // [2]
  title: string; // [3]
  description: string; // [4]
  price: number; // [5] - Гэрээнд MNT integer гэж үзэж байна
  imageUrl: string; // [6]
  campaignId: number; // [7]
  isSold: boolean; // [8]
  isActive: boolean; // [9]
  // metadataHash?: string; // Хэрэв гэрээнд metadataHash талбар байвал
}

export default function MarketplaceDetailPage() {
  const { id } = useParams();
  const [item, setItem] = useState<MarketplaceItem | null>(null);
  const [metadata, setMetadata] = useState<ItemMetadata | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchItem() {
      try {
        setLoading(true);

        const itemId = Number(id);
        if (isNaN(itemId) || itemId <= 0) {
          setError(`Invalid itemId: ${id}`);
          return;
        }

        if (!(window as any)?.ethereum) {
          setError('MetaMask not found!');
          return;
        }

        const provider = new BrowserProvider((window as any).ethereum);
        await provider.send('eth_requestAccounts', []);
        const signer = await provider.getSigner();
        const contract = getMarketplaceContract(signer);

        // 1) itemCount шалгах
        const itemCountBn = await contract.itemCount();
        const itemCount = Number(itemCountBn);
        if (itemId > itemCount) {
          setError(
            `Item ID ${itemId} нь нийт ${itemCount} item-ээс хэтэрсэн байна.`
          );
          return;
        }

        // 2) getItem(itemId) → struct дараалал: [id, seller, buyer, title, desc, price(MNT), imageUrl, campaignId, isSold, isActive, ...]
        const raw = await contract.getItem(itemId);
        console.log('getItem raw =', raw);

        // Массив задлах (жишээ struct: 0..9)
        const parsed: MarketplaceItem = {
          id: Number(raw[0]),
          seller: raw[1],
          buyer: raw[2],
          title: raw[3],
          description: raw[4],
          // Энд price нь MNT integer гэж үзэж байгаа тул шууд Number(...) авч байна
          price: Number(raw[5]),
          imageUrl: raw[6],
          campaignId: Number(raw[7]),
          isSold: raw[8],
          isActive: raw[9],
        };

        setItem(parsed);

        // 3) Хэрэв metadataHash байвал IPFS-ээс татах (жишээ)
        // if (parsed.metadataHash) {
        //   try {
        //     const metaJson = await fetchMetadataWithFallback(parsed.metadataHash);
        //     setMetadata(metaJson);
        //   } catch (metaErr) {
        //     console.warn('Failed to fetch item metadata:', metaErr);
        //   }
        // }
      } catch (err: any) {
        console.error('Failed to fetch item detail:', err);
        setError('Алдаа гарлаа: ' + err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchItem();
  }, [id]);

  // -------------------------------------------------------------------
  // Rendering
  // -------------------------------------------------------------------
  if (loading) {
    return (
      <div className='min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white to-blue-50'>
        <Skeleton className='h-40 w-3/4 rounded-md bg-gray-300 animate-pulse' />
        <p className='text-gray-500 mt-2'>Ачааллаж байна...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-red-50 p-4'>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className='max-w-md w-full'
        >
          <Alert variant='destructive' className='rounded-lg shadow-lg'>
            <div className='flex items-center gap-2 text-red-600'>
              <AlertTriangle className='w-5 h-5' />
              <AlertTitle>Алдаа</AlertTitle>
            </div>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </motion.div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50 p-4'>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className='max-w-md w-full'
        >
          <Alert variant='destructive' className='rounded-lg shadow-lg'>
            <div className='flex items-center gap-2 text-red-600'>
              <AlertTriangle className='w-5 h-5' />
              <AlertTitle>Алдаа</AlertTitle>
            </div>
            <AlertDescription>Item олдсонгүй.</AlertDescription>
          </Alert>
        </motion.div>
      </div>
    );
  }

  // ----- price-г MNT хэлбэрээр шууд авсан гэж үзнэ -----
  const priceMnt = item.price; // Жишээ: 100000 MNT

  // Хэрэв ETH-ээр бас харуулахыг хүсвэл MNT→ETH хөрвүүлнэ
  const priceEth = priceMnt / ETH_TO_MNT_RATE;

  // Optional animation variants
  const fadeUp = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0 },
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-white to-blue-50 p-8 flex flex-col items-center'>
      {/* Толгой хэсэг - анимэйшнтай hero-like блок */}
      <motion.div
        className='mb-6 text-center'
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className='text-3xl font-bold text-blue-700'>Marketplace Item</h1>
        <p className='text-gray-600 mt-1'>Дэлгэрэнгүй мэдээлэл</p>
      </motion.div>

      <div className='w-full max-w-4xl flex flex-col gap-6'>
        {/* Main item card */}
        <motion.div
          variants={fadeUp}
          initial='initial'
          animate='animate'
          transition={{ duration: 0.4 }}
        >
          <Card className='bg-white shadow-lg hover:shadow-2xl rounded-lg transition-all overflow-hidden'>
            <CardHeader className='bg-blue-100 text-blue-600 p-4 flex items-center gap-2'>
              <ImageIcon className='w-5 h-5' />
              <CardTitle className='text-2xl font-bold'>{item.title}</CardTitle>
            </CardHeader>

            <CardContent className='p-4 flex flex-col gap-4'>
              <p className='text-gray-800 leading-relaxed'>
                {item.description}
              </p>

              {item.imageUrl && (
                <div className='overflow-hidden rounded-lg mt-2'>
                  <motion.img
                    src={item.imageUrl}
                    alt='Item'
                    className='w-full h-auto object-cover transition-transform duration-300 hover:scale-105 rounded'
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        '/images/no-image.png';
                    }}
                    whileHover={{ scale: 1.03 }}
                  />
                </div>
              )}

              {/* Үнэ (MNT хэлбэрээр) */}
              <div className='mt-2 text-sm text-gray-800 space-y-1'>
                <p>
                  Үнэ (MNT):{' '}
                  <strong className='text-blue-600'>
                    {priceMnt.toLocaleString()} MNT
                  </strong>
                </p>
                <p>
                  Үнэ (ETH, ойролцоогоор):{' '}
                  <strong className='text-blue-600'>
                    {priceEth.toFixed(6)} ETH
                  </strong>
                </p>
              </div>

              {/* Худалдаж авах линк */}
              <Link href={`/marketplace/${item.id}/buy`}>
                <Button
                  variant='outline'
                  className='text-blue-600 border-blue-600 hover:bg-blue-100 mt-4 w-full sm:w-auto'
                >
                  Худалдаж авах
                </Button>
              </Link>

              {/* Buyer талбар хэрэв 0x000... биш бол */}
              {item.buyer !== '0x0000000000000000000000000000000000000000' && (
                <motion.p
                  className='mt-2 text-sm text-green-600 font-medium'
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  Худалдан авагч: <strong>{item.buyer}</strong>
                </motion.p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Хэрэв metadata байгаа бол: story, extraImages, etc. */}
        {metadata && (
          <motion.div
            variants={fadeUp}
            initial='initial'
            animate='animate'
            transition={{ duration: 0.4, delay: 0.1 }}
            className='flex flex-col gap-6'
          >
            <Card className='bg-white shadow rounded-lg hover:shadow-xl transition-all overflow-hidden'>
              <CardHeader className='p-4 bg-blue-100 flex items-center gap-2'>
                <BookOpen className='w-5 h-5 text-blue-900' />
                <CardTitle className='text-lg font-semibold text-blue-900'>
                  Нэмэлт мэдээлэл (Metadata)
                </CardTitle>
              </CardHeader>
              <CardContent className='p-4 flex flex-col gap-3'>
                <section>
                  <h4 className='font-medium'>Story</h4>
                  <p className='text-gray-700'>{metadata.story || '—'}</p>
                </section>
                {metadata.extraImages && metadata.extraImages.length > 0 && (
                  <section>
                    <h4 className='font-medium mt-2'>Нэмэлт зургууд</h4>
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2'>
                      {metadata.extraImages.map((imgUrl, i) => (
                        <motion.img
                          key={i}
                          src={imgUrl}
                          alt={`Extra ${i}`}
                          className='rounded object-cover w-full h-40'
                          whileHover={{ scale: 1.02 }}
                        />
                      ))}
                    </div>
                  </section>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
