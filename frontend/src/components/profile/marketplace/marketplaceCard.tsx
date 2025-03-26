/***********************************
 * MarketplaceCard.tsx
 ***********************************/
import { MarketplaceItem } from '@/app/interfaces';
import { ethers } from 'ethers';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';

/**
 * Marketplace‐ийн Item төлөвийг текстээр харуулах
 * (idэвхтэй / зарагдсан / ... гэх мэт)
 */
function getItemStatusText(item: MarketplaceItem): string {
  if (item.isSold) {
    return 'Зарагдсан';
  } else if (item.isActive) {
    return 'Идэвхтэй';
  } else {
    return 'Идэвхгүй';
  }
}

// ----------------------------------------
// MarketplaceCard компонентийг дор тодорхойлов
// ----------------------------------------
export function MarketplaceCard({
  item,
  currentUser,
}: {
  item: MarketplaceItem;
  currentUser: string | null;
}) {
  // price нь string хэлбэртэй. BigInt руу хөрвүүлж ETH болон MNT руу шилжүүлнэ.
  const priceWei = BigInt(item.price);
  const priceEthString = ethers.formatEther(priceWei);
  const priceEthNum = parseFloat(priceEthString);
  const approximateMnt = Math.floor(priceEthNum * 6_000_000);

  // Эзэмшигч мөн эсэх
  const isOwner =
    currentUser && currentUser.toLowerCase() === item.seller.toLowerCase();

  const statusText = getItemStatusText(item);

  return (
    <motion.div
      whileHover={{ scale: 1.02, boxShadow: '0px 8px 16px rgba(0,0,0,0.2)' }}
      transition={{ duration: 0.3 }}
    >
      <Card className='bg-gray-100 shadow-lg hover:shadow-xl transition-shadow'>
        {item.imageUrl && (
          <motion.img
            src={item.imageUrl}
            alt={item.title}
            className='h-40 w-full object-cover rounded-t-lg'
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                '/images/no-image.png';
            }}
          />
        )}
        <CardHeader className='bg-blue-100 text-blue-600 p-4 flex gap-2 flex-row items-center justify-center'>
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
          >
            <ShoppingCart className='w-6 h-6' />
          </motion.div>
          <CardTitle>{item.title}</CardTitle>
        </CardHeader>
        <CardContent className='p-4'>
          <p className='text-gray-900 mb-2'>{item.description}</p>

          {/* Үнийн мэдээлэл */}
          <div className='mb-3 text-sm text-gray-900'>
            <p>
              Үнэ (MNT):{' '}
              <strong className='text-blue-600'>
                {approximateMnt.toLocaleString()} MNT
              </strong>
            </p>
          </div>

          {/* Төлөвийг үзүүлэх */}
          <p className='text-sm font-medium mb-2'>
            Төлөв: <span className='text-blue-600'>{statusText}</span>
          </p>

          {/* Хэрэв эзэмшигч бол "Засах" товч, биш бол "Худалдаж авах" товч */}
          <Link href={`/marketplace/${item.id}`}>
            <Button
              variant='outline'
              className='text-blue-600 border-blue-600 hover:bg-blue-100 w-full mb-3'
            >
              Дэлгэрэнгүй
            </Button>
          </Link>

          {isOwner ? (
            <Link href={`/marketplace/${item.id}/edit`}>
              <Button className='bg-blue-600 text-white w-full'>Засах</Button>
            </Link>
          ) : !item.isSold && item.isActive ? (
            <Link href={`/marketplace/${item.id}/buy`}>
              <Button className='bg-blue-600 text-white'>Худалдаж авах</Button>
            </Link>
          ) : null}

          {/* Эзэмшигч мөн бол харуулах */}
          {isOwner && (
            <p className='mt-3 text-sm text-green-600 font-medium'>
              Та энэ item-ийн эзэмшигч байна.
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
