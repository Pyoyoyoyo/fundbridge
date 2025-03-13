'use client';

import { ChangeEvent, useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

/** Тухайн нэмэх бараа/зүйлийн төрөл */
interface Item {
  name: string;
  description: string;
  image: string;
}

/** RewardsStep компонентын проп */
interface RewardsStepProps {
  formData: {
    rewards: {
      items: Item[];
      description: string;
    };
  };
  updateFormData: (fields: Partial<any>) => void;
  // Хэрэв илүү тодорхой төрөлтэй ажиллах бол:
  // updateFormData: (fields: Partial<FormData>) => void;
}

/**
 * RewardsStep:
 *  - `formData.rewards.items` массив дээр бараа/зүйлсийг нэмэх
 *  - Шинэ барааны зургийг preview хийж харуулах
 *  - Нийт шагналын (reward) тайлбарыг бичих
 */
export default function RewardsStep({
  formData,
  updateFormData,
}: RewardsStepProps) {
  // `rewards` дотор items, description талбаруудыг шууд ашиглана
  const rewards = formData.rewards;
  const items = rewards.items ?? [];

  // Шинэ бараа/зүйлийг түр хадгалах локал state
  const [newItem, setNewItem] = useState<Item>({
    name: '',
    description: '',
    image: '',
  });

  /**
   * Зураг (image/*) сонгоход FileReader ашиглан preview string үүсгэж newItem.image-т онооно
   */
  function handleImageUpload(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        setNewItem((prev) => ({ ...prev, image: result }));
      };
      reader.readAsDataURL(file);
    }
  }

  /**
   * Шинэ бараа/зүйлийг items массивт нэмэх
   */
  function addItem() {
    if (newItem.name && newItem.description) {
      // Одоогийн items массив дээр шинээр үүсгэсэн барааг нэмнэ
      const updatedItems = [...items, newItem];

      // rewards.description хэвээр үлдээж, зөвхөн items-ийг шинэчлэх
      updateFormData({
        rewards: {
          ...rewards,
          items: updatedItems,
        },
      });
      // Талбаруудыг буцааж хоослох
      setNewItem({ name: '', description: '', image: '' });
    }
  }

  return (
    <div className='space-y-6'>
      <h2 className='text-2xl font-semibold text-gray-800'>
        Шагнал (Rewards) үүсгэх
      </h2>
      <p className='text-gray-600'>
        Төслийн шагналуудыг энд тодорхойлж, дэмжигчдэд ямар урамшуулал очихыг
        ойлгомжтой болгоно уу.
      </p>

      {/* Шинэ бараа/зүйл нэмэх хэсэг */}
      <Card>
        <CardHeader>
          <CardTitle>Шинэ бараа/зүйл нэмэх</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <Input
            placeholder='Зүйлийн нэр (жишээ: Цахим ном)'
            value={newItem.name}
            onChange={(e) =>
              setNewItem((prev) => ({ ...prev, name: e.target.value }))
            }
          />
          <Textarea
            placeholder='Зүйлийн тайлбар'
            value={newItem.description}
            onChange={(e) =>
              setNewItem((prev) => ({ ...prev, description: e.target.value }))
            }
          />
          {newItem.image && (
            <div className='mb-2'>
              <img
                src={newItem.image}
                alt='Зураг'
                className='h-40 w-full object-cover rounded'
              />
            </div>
          )}
          <Input type='file' accept='image/*' onChange={handleImageUpload} />
          <p className='text-sm text-gray-500'>
            Зураг нь JPG, PNG, GIF эсвэл WEBP байж болно, 50 MB-ээс ихгүй.
          </p>

          <Button onClick={addItem} className='bg-blue-600 text-white'>
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
          <Textarea
            placeholder="Шагналын дэлгэрэнгүй (жишээ: '100k ₮-ийн дэмжлэг өгвөл ...')"
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
        </CardContent>
      </Card>
    </div>
  );
}
