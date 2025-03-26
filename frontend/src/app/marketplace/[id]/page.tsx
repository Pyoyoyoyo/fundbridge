'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { BrowserProvider, ethers } from 'ethers';
import { motion } from 'framer-motion';

import { getMarketplaceContract } from '@/services/marketplaceConfig';

// UI компонентийн импортууд
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, ImageIcon, BookOpen } from 'lucide-react';

// Таны төлбөрийн табуудын компонент (доорх PaymentTabs жишээ)
import PaymentTabs from '@/components/marketplace/PaymentTabs';
import { ItemMetadata, MarketplaceItem } from '@/app/interfaces';

const ETH_TO_MNT_RATE = 6_000_000;

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
          setError('MetaMask олдсонгүй!');
          return;
        }

        const provider = new BrowserProvider((window as any).ethereum);
        await provider.send('eth_requestAccounts', []);
        const signer = await provider.getSigner();
        const contract = getMarketplaceContract(signer);

        // Жишээ нь getItem(...) гэж байгааг хэрэглэгч өөрийн contract‐ын логикт тааруулна
        const raw = await contract.getItem(itemId);

        const parsed: MarketplaceItem = {
          id: Number(raw[0]),
          seller: raw[1],
          buyer: raw[2],
          title: raw[3],
          description: raw[4],
          price: raw[5].toString(), // wei
          imageUrl: raw[6],
          campaignId: Number(raw[7]),
          isSold: raw[8],
          isActive: raw[9],
        };

        setItem(parsed);

        // Хэрэв метадата CID байвал энд татах боломжтой
        // setMetadata(...)
      } catch (err: any) {
        console.error('Failed to fetch item detail:', err);
        setError('Алдаа гарлаа: ' + err.message);
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchItem();
  }, [id]);

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

  // ETH үнэ -> MNT
  const priceEth = parseFloat(ethers.formatEther(item.price));
  const approximateMNT = Math.floor(priceEth * ETH_TO_MNT_RATE);

  return (
    <div className='min-h-screen bg-gradient-to-br from-white to-blue-50 p-8'>
      <motion.div
        className='mb-6 text-center'
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className='text-3xl font-bold text-blue-700'>Marketplace Item</h1>
        <p className='text-gray-600 mt-1'>Дэлгэрэнгүй мэдээлэл</p>
      </motion.div>

      <div className='max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8'>
        {/* Зүүн талын колонк */}
        <motion.div
          variants={{
            initial: { opacity: 0, y: 15 },
            animate: { opacity: 1, y: 0 },
          }}
          initial='initial'
          animate='animate'
          transition={{ duration: 0.4 }}
        >
          <Card className='bg-white shadow-lg hover:shadow-2xl rounded-lg transition-all overflow-hidden'>
            <CardHeader className='bg-blue-100 text-blue-600 p-4 flex items-center justify-center flex-row gap-2'>
              <ImageIcon className='w-5 h-5' />
              <CardTitle className='text-2xl font-bold'>{item.title}</CardTitle>
            </CardHeader>
            <CardContent className='p-4 flex flex-col gap-4'>
              <p className='text-gray-800 leading-relaxed'>
                {item.description}
              </p>

              {/* Хэрэв зураг байвал */}
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

              {/* Хэрэв buyer байгаа бол */}
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

              {/* Хэрэв нэмэлт metadata татсан бол */}
              {metadata && (
                <Card className='bg-white shadow rounded-lg hover:shadow-xl transition-all overflow-hidden mt-4'>
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
                    {metadata.extraImages &&
                      metadata.extraImages.length > 0 && (
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
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Баруун талын колонк */}
        <motion.div
          variants={{
            initial: { opacity: 0, y: 15 },
            animate: { opacity: 1, y: 0 },
          }}
          initial='initial'
          animate='animate'
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {/* Эндээс эхэлж төлбөрийн хэсгийг илүү ойлгомжтой болгохын тулд
              тусад нь компонент болгон задласан PaymentTabs-ээ хэрэглэнэ */}
          <div className='bg-white p-4 rounded-lg shadow mb-4'>
            <h2 className='text-lg font-semibold text-gray-800'>
              Төлбөрөө хэрхэн хийх вэ?
            </h2>
            <p className='text-sm text-gray-600 mt-2'>
              Та доорх табуудаас өөрт тохирох төлбөрийн аргыг сонгоод,
              шаардлагатай мэдээллээ бөглөөд “Төлбөр хийх” эсвэл “Хандив өгөх”
              товчийг дарж баталгаажуулна уу.
            </p>
            <ul className='list-disc ml-5 text-sm text-gray-600 mt-3 space-y-1'>
              <li>ETH сонгосон үед MetaMask-ээр дамжуулан шууд илгээнэ.</li>
              <li>
                Fiat буюу төгрөг сонгосон бол банкны гүйлгээ эсвэл QPay
                ашиглана.
              </li>
              <li>
                Карт сонгосон бол Stripe эсвэл бусад картын төлбөрийн гүүр
                ашиглана.
              </li>
            </ul>
          </div>

          {/* Таны тусад нь задлан бичсэн төлбөрийн Tabs (PaymentTabs) */}
          <PaymentTabs
            itemId={item.id}
            price={item.price}
            approximateMNT={approximateMNT}
          />
        </motion.div>
      </div>
    </div>
  );
}
