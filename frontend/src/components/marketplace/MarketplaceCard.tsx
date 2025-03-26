import { MarketplaceItem } from '@/app/interfaces';
import { ethers } from 'ethers';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';

export // ----------------------------------------
// MarketplaceCard компонентийг дор тодорхойлов
// ----------------------------------------
function MarketplaceCard({
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

  // (A) item.seller === currentUser => эзэмшигч мөн эсэх
  const isOwner =
    currentUser && currentUser.toLowerCase() === item.seller.toLowerCase();

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
              Үнэ (ETH):{' '}
              <strong className='text-blue-600'>{priceEthString} ETH</strong>
            </p>
            <p>
              Үнэ (MNT, ойролцоогоор):{' '}
              <strong className='text-blue-600'>
                {approximateMnt.toLocaleString()} MNT
              </strong>
            </p>
          </div>

          {/* Худалдаж авах эсвэл зарагдсан эсэх */}
          {item.isSold ? (
            <div className='text-red-600 font-medium'>
              Энэ item аль хэдийн зарагдсан байна!
            </div>
          ) : (
            <div className='flex items-center gap-3'>
              <Link href={`/marketplace/${item.id}`}>
                <Button
                  variant='outline'
                  className='text-blue-600 border-blue-600 hover:bg-blue-100'
                >
                  Дэлгэрэнгүй
                </Button>
              </Link>
              <Link href={`/marketplace/${item.id}`}>
                <Button className='bg-blue-600 text-white'>
                  Худалдаж авах
                </Button>
              </Link>
            </div>
          )}

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
