'use client';

import { ChangeEvent, useState } from 'react';
import { motion } from 'framer-motion';
import { Gift, Edit, FileImage, StickyNote, PackagePlus } from 'lucide-react';
import Image from 'next/image';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

import rewardsIllustration from '@img/campaign/rewards-illustration.svg';
import { RewardItem } from '@/app/interfaces';

interface RewardsStepProps {
  formData: {
    rewards: {
      items: RewardItem[];
      description: string;
    };
  };
  updateFormData: (fields: Partial<any>) => void;
}

export default function RewardsStep({
  formData,
  updateFormData,
}: RewardsStepProps) {
  const rewards = formData.rewards;
  const items = rewards.items ?? [];

  const [newItem, setNewItem] = useState<RewardItem>({
    name: '',
    description: '',
    image: '',
  });

  const [uploading, setUploading] = useState(false);

  // IPFS‐д зураг upload
  async function handleImageUpload(e: ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/pinataUploadImage', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to upload image to IPFS');
      }

      const { ipfsUrl } = await res.json();
      // ipfs://... эсвэл gateway link
      setNewItem((prev) => ({ ...prev, image: ipfsUrl }));
      alert('Шагналын зураг амжилттай upload хийгдлээ!');
    } catch (err: any) {
      console.error(err);
      alert('Зураг upload алдаа: ' + err.message);
    } finally {
      setUploading(false);
    }
  }

  function addItem() {
    if (newItem.name && newItem.description) {
      const updatedItems = [...items, newItem];
      updateFormData({
        rewards: {
          ...rewards,
          items: updatedItems,
        },
      });
      setNewItem({ name: '', description: '', image: '' });
    } else {
      alert('Нэр болон тайлбар хоосон байна!');
    }
  }

  return (
    <motion.div
      className='flex flex-col gap-6 bg-white p-6 rounded shadow'
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
    >
      {/* Дээд талд иллюстрац, гарчиг, товч тайлбар */}
      <div className='flex flex-col items-center text-center space-y-4'>
        <Image
          src={rewardsIllustration}
          alt='Rewards illustration'
          width={760}
          height={100}
        />
        <div className='flex items-center gap-2 text-xl font-semibold text-blue-600'>
          <Gift className='w-6 h-6' />
          <span>Шагнал (Rewards) үүсгэх</span>
        </div>
        <p className='text-gray-600'>
          Төслийн шагналуудыг тодорхойлж, дэмжигчдэд ямар урамшуулал очихыг
          тайлбарлана уу.
        </p>
      </div>

      {/* Шинэ бараа/зүйл нэмэх хэсэг */}
      <Card>
        <CardHeader>
          <CardTitle>Шинэ бараа/зүйл нэмэх</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          {/* Нэр */}
          <div className='space-y-2'>
            <label className='flex items-center gap-1 font-medium text-gray-700'>
              <Edit className='w-4 h-4 text-gray-500' />
              Зүйлийн нэр
            </label>
            <Input
              placeholder='Жишээ: Цахим ном'
              value={newItem.name}
              onChange={(e) =>
                setNewItem((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </div>

          {/* Тайлбар */}
          <div className='space-y-2'>
            <label className='flex items-center gap-1 font-medium text-gray-700'>
              <StickyNote className='w-4 h-4 text-gray-500' />
              Зүйлийн тайлбар
            </label>
            <Textarea
              placeholder='Зүйлийн тайлбар'
              value={newItem.description}
              onChange={(e) =>
                setNewItem((prev) => ({ ...prev, description: e.target.value }))
              }
            />
          </div>

          {/* Зураг (IPFS) */}
          <div className='space-y-2'>
            <label className='flex items-center gap-1 font-medium text-gray-700'>
              <FileImage className='w-4 h-4 text-gray-500' />
              Зураг (IPFS)
            </label>
            {newItem.image && (
              <div className='mb-2'>
                <img
                  src={newItem.image}
                  alt='Зураг'
                  className='h-40 w-full object-cover rounded'
                />
              </div>
            )}
            <Input
              type='file'
              accept='image/*'
              onChange={handleImageUpload}
              disabled={uploading}
            />
            {uploading && (
              <p className='text-sm text-blue-600'>Uploading image...</p>
            )}
            <p className='text-sm text-gray-500'>
              JPG, PNG, GIF эсвэл WEBP (50 MB-ээс ихгүй)
            </p>
          </div>

          <Button onClick={addItem} className='bg-blue-600 text-white'>
            <PackagePlus className='w-4 h-4 mr-2' />
            Нэмэх
          </Button>
        </CardContent>
      </Card>

      {/* Одоогийн оруулсан бараа/зүйлсийн жагсаалт */}
      {items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Оруулсан бараа/зүйлс</CardTitle>
          </CardHeader>
          <CardContent>
            {items.map((item, index) => (
              <div key={index} className='mb-4'>
                <h3 className='text-lg font-medium'>{item.name}</h3>
                <p className='text-gray-600'>{item.description}</p>
                {item.image && (
                  <div className='mb-2'>
                    <img
                      src={item.image}
                      alt='Зураг'
                      className='h-40 w-full object-cover rounded'
                    />
                  </div>
                )}
                <Separator className='my-2' />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Шагналын ерөнхий тайлбар */}
      <Card>
        <CardHeader>
          <CardTitle>Шагналын ерөнхий тайлбар</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-2'>
            <label className='flex items-center gap-1 font-medium text-gray-700'>
              <Gift className='w-4 h-4 text-gray-500' />
              Шагналын дэлгэрэнгүй
            </label>
            <Textarea
              placeholder='Жишээ: 100k ₮-ийн дэмжлэг өгвөл ...'
              value={rewards.description ?? ''}
              onChange={(e) =>
                updateFormData({
                  rewards: {
                    ...rewards,
                    description: e.target.value,
                  },
                })
              }
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
