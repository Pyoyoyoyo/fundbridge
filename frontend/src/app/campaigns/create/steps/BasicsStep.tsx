'use client';

import { useState, ChangeEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import Image from 'next/image';
import { FormData } from '@/app/campaigns/create/interfaces/types'; // <-- Замыг тохируулна

// Props тодорхойлолт
interface BasicsStepProps {
  formData: FormData;
  updateFormData: (fields: Partial<FormData>) => void;
}

export default function BasicsStep({
  formData,
  updateFormData,
}: BasicsStepProps) {
  // formData.basics объект доторх утгуудыг авч байна
  const basics = formData.basics;

  // Локал preview state
  const [imagePreview, setImagePreview] = useState<string | null>(
    basics.imageUrl || null
  );
  const [videoPreview, setVideoPreview] = useState<string | null>(
    basics.videoUrl || null
  );

  // Зураг upload хийхэд preview-г үзүүлж, formData.basics.imageUrl-ийг шинэчилнэ
  function handleImageUpload(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        setImagePreview(result);
        // updateFormData-д basics.imageUrl шинэчлэл
        updateFormData({
          basics: {
            ...basics,
            imageUrl: result,
          },
        });
      };
      reader.readAsDataURL(file);
    }
  }

  // Видео upload хийхэд preview-г үзүүлж, formData.basics.videoUrl-ийг шинэчилнэ
  function handleVideoUpload(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const videoURL = URL.createObjectURL(file);
      setVideoPreview(videoURL);
      updateFormData({
        basics: {
          ...basics,
          videoUrl: videoURL,
        },
      });
    }
  }

  return (
    <div className='space-y-6'>
      <h2 className='text-xl font-semibold text-gray-800'>
        Үндсэн мэдээлэл (Basics)
      </h2>
      <p className='text-gray-600'>
        Танай төслийг бусдад ойлгомжтой болгох үүднээс доорх мэдээллийг бөглөнө
        үү.
      </p>

      {/* Төслийн нэр */}
      <div className='space-y-2'>
        <label className='block font-medium text-gray-700'>Төслийн нэр</label>
        <Input
          placeholder='Жишээ: Papercuts: A Party Game for the Rude and Well-Read'
          maxLength={60}
          // Анхнаасаа string утга дамжуулна
          value={basics.title ?? ''}
          onChange={(e) =>
            updateFormData({
              basics: {
                ...basics,
                title: e.target.value,
              },
            })
          }
        />
        <p className='text-sm text-gray-500'>0/60 (максимум 60 тэмдэгт)</p>
      </div>

      {/* Товч танилцуулга */}
      <div className='space-y-2'>
        <label className='block font-medium text-gray-700'>
          Товч танилцуулга
        </label>
        <Textarea
          placeholder='Төслийн зорилго, мөн чанар, товч тайлбар...'
          maxLength={135}
          value={basics.description ?? ''}
          onChange={(e) =>
            updateFormData({
              basics: {
                ...basics,
                description: e.target.value,
              },
            })
          }
          className='h-20'
        />
        <p className='text-sm text-gray-500'>0/135 (максимум 135 тэмдэгт)</p>
      </div>

      {/* Төслийн төрөл (Хандив / Хөрөнгө оруулалт) */}
      <div className='space-y-2'>
        <label className='block font-medium text-gray-700'>Төслийн төрөл</label>
        <Select
          value={basics.primaryCategory ?? ''}
          onValueChange={(val) =>
            updateFormData({
              basics: {
                ...basics,
                primaryCategory: val,
              },
            })
          }
        >
          <SelectTrigger className='w-full'>
            <SelectValue placeholder='Төслийн төрөл сонгох' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='Хандив'>Хандив</SelectItem>
            <SelectItem value='Хөрөнгө оруулалт'>Хөрөнгө оруулалт</SelectItem>
          </SelectContent>
        </Select>
        <p className='text-sm text-gray-500'>
          Танай төсөл “Хандив” эсвэл “Хөрөнгө оруулалт” байж болно.
        </p>
      </div>

      {/* Төслийн зураг */}
      <div className='space-y-2'>
        <label className='block font-medium text-gray-700'>Төслийн зураг</label>
        {imagePreview && (
          <div className='mb-2'>
            <img
              src={imagePreview}
              alt='Preview'
              className='h-40 w-full object-cover rounded'
            />
          </div>
        )}
        <Input type='file' accept='image/*' onChange={handleImageUpload} />
        <p className='text-sm text-gray-500'>
          JPG, PNG, GIF, эсвэл WEBP байж болно, 50 MB-ээс ихгүй байх.
        </p>
      </div>

      {/* Төслийн видео (заавал биш) */}
      <div className='space-y-2'>
        <label className='block font-medium text-gray-700'>
          Төслийн видео (заавал биш)
        </label>
        {videoPreview && (
          <div className='mb-2'>
            <video src={videoPreview} controls className='w-full rounded' />
          </div>
        )}
        <Input type='file' accept='video/*' onChange={handleVideoUpload} />
        <p className='text-sm text-gray-500'>
          MOV, MPEG, AVI, MP4, 3GP, WMV, эсвэл FLV, 5120 MB-ээс ихгүй байна.
        </p>
      </div>

      {/* Санхүүжилтийн зорилго (goal) */}
      <div className='space-y-2'>
        <label className='block font-medium text-gray-700'>
          Санхүүжилтийн дүн
        </label>
        <Input
          type='number'
          placeholder='0'
          value={basics.goal ?? ''}
          onChange={(e) =>
            updateFormData({
              basics: {
                ...basics,
                goal: e.target.value,
              },
            })
          }
        />
        <p className='text-sm text-gray-500'>
          Хэрэв зорилтот дүндээ хүрэхгүй бол та мөнгө хүлээн авахгүй.
        </p>
      </div>

      {/* Хугацаа эхлүүлэх зорилтот огноо (заавал биш) */}
      <div className='space-y-2'>
        <label className='block font-medium text-gray-700'>
          Зорилтот эхлүүлэх огноо (заавал биш)
        </label>
        <Input
          type='date'
          value={basics.targetLaunchDate ?? ''}
          onChange={(e) =>
            updateFormData({
              basics: {
                ...basics,
                targetLaunchDate: e.target.value,
              },
            })
          }
        />
        <p className='text-sm text-gray-500'>
          Хэрэв та тодорхой өдөр эхлүүлэхээр төлөвлөж байгаа бол энд
          тэмдэглээрэй.
        </p>
      </div>

      {/* Кампанит ажлын үргэлжлэх хугацаа */}
      {/* Хэрэв таны basics-д campaignDuration гэдэг талбар байвал */}
      {/* <div className="space-y-2">
        <label className="block font-medium text-gray-700">
          Кампанит ажлын үргэлжлэх хугацаа (өдөр)
        </label>
        <Input
          type="number"
          placeholder="1-60"
          value={basics.campaignDuration ?? ''}
          onChange={(e) =>
            updateFormData({
              basics: {
                ...basics,
                campaignDuration: e.target.value,
              },
            })
          }
        />
        <p className="text-sm text-gray-500">
          30 хоног ба түүнээс бага хугацаатай төслүүд амжилттай байх магадлал өндөр байдаг.
        </p>
      </div> */}

      {/* Late pledges (сонголтоор) */}
      <div className='space-y-2'>
        <label className='block font-medium text-gray-700'>Late Pledges</label>
        <div className='flex items-center space-x-2'>
          <Switch
            checked={basics.latePledges || false}
            onCheckedChange={(checked) =>
              updateFormData({
                basics: {
                  ...basics,
                  latePledges: checked,
                },
              })
            }
          />
          <span className='text-sm text-gray-700'>
            {basics.latePledges
              ? 'Тийм, Late Pledges идэвхжүүлэх'
              : 'Үгүй, Late Pledges хэрэггүй'}
          </span>
        </div>
      </div>
    </div>
  );
}
