'use client';

import { useState, ChangeEvent } from 'react';
import { motion } from 'framer-motion';
import {
  ImageIcon,
  Info,
  Calendar,
  FileImage,
  VideoIcon,
  Coins,
  Flag,
  Hourglass,
  Terminal,
} from 'lucide-react';
import Image from 'next/image';
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
import basicsIllustration from '@img/campaign/basics-illustration.svg';
import type { FormData } from '@/app/campaigns/create/interfaces/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface BasicsStepProps {
  formData: FormData;
  updateFormData: (fields: Partial<FormData>) => void;
}

export default function BasicsStep({
  formData,
  updateFormData,
}: BasicsStepProps) {
  const basics = formData.basics;

  // Локал preview (зураг, видео) хадгалах state
  const [imagePreview, setImagePreview] = useState<string | null>(
    basics.imageUrl || null
  );
  const [videoPreview, setVideoPreview] = useState<string | null>(
    basics.videoUrl || null
  );

  // Upload-даж буй эсэх төлөв
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  /**
   * ------------------------
   * ЗУРАГ upload + preview
   * ------------------------
   */
  async function handleImageUpload(e: ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    try {
      // 1) Локал preview (түр зуур харуулах)
      const localPreview = URL.createObjectURL(file);
      setImagePreview(localPreview);

      // 2) IPFS рүү upload
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/pinataUploadImage', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to upload image');
      }

      // 3) IPFS URL-ийг буцааж авах
      const { ipfsUrl } = await res.json();

      // 4) Preview-г нь IPFS gateway URL болгож шинэчилнэ
      setImagePreview(ipfsUrl);

      // 5) formData-д хадгалах
      updateFormData({
        basics: {
          ...basics,
          imageUrl: ipfsUrl,
        },
      });

      <Alert>
        <Terminal className='h-4 w-4' />
        <AlertTitle>Зураг амжилттай IPFS-д байршууллаа!</AlertTitle>
      </Alert>;
    } catch (err: any) {
      console.error(err);
      <Alert>
        <Terminal className='h-4 w-4' />
        <AlertTitle>Зураг upload алдаа: + {err.message}</AlertTitle>
      </Alert>;
    } finally {
      setUploadingImage(false);
    }
  }

  /**
   * -------------------------
   * ВИДЕО upload + preview
   * -------------------------
   */
  async function handleVideoUpload(e: ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    try {
      // 1) Локал preview
      const localVideoPreview = URL.createObjectURL(file);
      setVideoPreview(localVideoPreview);

      // 2) IPFS рүү upload
      setUploadingVideo(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/pinataUploadImage', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to upload video');
      }

      const { ipfsUrl } = await res.json();

      // 3) Preview-г нь IPFS link болгож солих (хэрэв IPFS gateway link бол шууд тоглуулж болно)
      setVideoPreview(ipfsUrl);

      // 4) formData-д хадгалах
      updateFormData({
        basics: {
          ...basics,
          videoUrl: ipfsUrl,
        },
      });
      <Alert>
        <Terminal className='h-4 w-4' />
        <AlertTitle>Видео амжилттай IPFS-д байршууллаа!</AlertTitle>
      </Alert>;
    } catch (err: any) {
      console.error(err);
      <Alert>
        <Terminal className='h-4 w-4' />
        <AlertTitle>Видео upload алдаа: + {err.message}</AlertTitle>
      </Alert>;
    } finally {
      setUploadingVideo(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      className='flex flex-col gap-8 p-6 bg-white rounded shadow'
    >
      {/* Дээд талд: Иллюстрац, гарчиг, товч тайлбар */}
      <div className='flex flex-col items-center text-center space-y-4'>
        <Image
          src={basicsIllustration}
          alt='Basics illustration'
          width={760}
          height={100}
          priority
        />
        <div className='flex items-center gap-2 text-blue-600 font-semibold text-xl'>
          <ImageIcon className='w-6 h-6' />
          <span>Үндсэн мэдээлэл</span>
        </div>
        <p className='text-gray-600 max-w-md mx-auto'>
          Төслийнхөө гол агуулгыг бөглөж, бусдад ойлгомжтой байлгаарай.
        </p>
      </div>

      {/* Доод талд: Бүх талбарууд */}
      <div className='flex flex-col space-y-6'>
        {/* Төслийн нэр */}
        <div className='space-y-2'>
          <label className='flex items-center gap-1 font-medium text-gray-700'>
            <Info className='w-4 h-4 text-gray-500' />
            Төслийн нэр
          </label>
          <Input
            placeholder='Жишээ: Papercuts...'
            maxLength={60}
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
          <p className='text-xs text-gray-500'>
            {basics.title?.length ?? 0}/60 тэмдэгт
          </p>
        </div>

        {/* Төслийн төрөл */}
        <div className='space-y-2'>
          <label className='flex items-center gap-1 font-medium text-gray-700'>
            <Flag className='w-4 h-4 text-gray-500' />
            Төслийн төрөл
          </label>
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
          <p className='text-xs text-gray-500'>Хандив эсвэл Хөрөнгө оруулалт</p>
        </div>

        {/* Товч танилцуулга */}
        <div className='space-y-2'>
          <label className='flex items-center gap-1 font-medium text-gray-700'>
            <Info className='w-4 h-4 text-gray-500' />
            Товч танилцуулга
          </label>
          <Textarea
            placeholder='Төслийн зорилго, товч тайлбар...'
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
          <p className='text-xs text-gray-500'>
            {basics.description?.length ?? 0}/135 тэмдэгт
          </p>
        </div>

        {/* Санхүүжилтийн дүн */}
        <div className='space-y-2'>
          <label className='flex items-center gap-1 font-medium text-gray-700'>
            <Coins className='w-4 h-4 text-gray-500' />
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
          <p className='text-xs text-gray-500'>
            Хэрэв зорилтот дүндээ хүрэхгүй бол та мөнгө хүлээн авахгүй.
          </p>
        </div>

        {/* Эхлүүлэх огноо */}
        <div className='space-y-2'>
          <label className='flex items-center gap-1 font-medium text-gray-700'>
            <Calendar className='w-4 h-4 text-gray-500' />
            Эхлүүлэх огноо
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
          <p className='text-xs text-gray-500'>
            Хэрэв та тодорхой өдөр эхлүүлэхээр төлөвлөж байгаа бол энд бичнэ үү.
          </p>
        </div>

        {/* Дуусах огноо */}
        <div className='space-y-2'>
          <label className='flex items-center gap-1 font-medium text-gray-700'>
            <Hourglass className='w-4 h-4 text-gray-500' />
            Дуусах огноо
          </label>
          <Input
            type='date'
            value={basics.targetEndDate ?? ''}
            onChange={(e) =>
              updateFormData({
                basics: {
                  ...basics,
                  targetEndDate: e.target.value,
                },
              })
            }
          />
          <p className='text-xs text-gray-500'>
            Төслийн үргэлжлэх хугацааг тодорхойлох боломжтой.
          </p>
        </div>

        {/* Late Pledges */}
        <div className='space-y-2'>
          <label className='flex items-center gap-1 font-medium text-gray-700'>
            <Hourglass className='w-4 h-4 text-gray-500' />
            Late Pledges
          </label>
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
                ? 'Тийм, идэвхжүүлэх'
                : 'Үгүй, Late Pledges хэрэггүй'}
            </span>
          </div>
        </div>

        {/* Төслийн зураг (IPFS) */}
        <div className='space-y-2'>
          <label className='flex items-center gap-1 font-medium text-gray-700'>
            <FileImage className='w-4 h-4 text-gray-500' />
            Төслийн зураг (IPFS)
          </label>
          {imagePreview && (
            <div className='mb-2'>
              {/* Preview нь gateway link бол шууд харуулна */}
              <img
                src={imagePreview}
                alt='Preview'
                className='h-40 w-full object-cover rounded'
              />
            </div>
          )}
          <Input
            type='file'
            accept='image/*'
            onChange={handleImageUpload}
            disabled={uploadingImage}
          />
          {uploadingImage && (
            <p className='text-sm text-blue-600'>
              Зураг IPFS рүү илгээгдэж байна...
            </p>
          )}
          <p className='text-xs text-gray-500'>
            JPG, PNG, GIF, эсвэл WEBP байж болно (50 MB-ээс ихгүй).
          </p>
        </div>

        {/* Төслийн видео (IPFS) */}
        <div className='space-y-2'>
          <label className='flex items-center gap-1 font-medium text-gray-700'>
            <VideoIcon className='w-4 h-4 text-gray-500' />
            Төслийн видео (IPFS) - Заавал биш
          </label>
          {videoPreview && (
            <div className='mb-2'>
              <video src={videoPreview} controls className='w-full rounded' />
            </div>
          )}
          <Input
            type='file'
            accept='video/*'
            onChange={handleVideoUpload}
            disabled={uploadingVideo}
          />
          {uploadingVideo && (
            <p className='text-sm text-blue-600'>
              Видео IPFS рүү илгээгдэж байна...
            </p>
          )}
          <p className='text-xs text-gray-500'>
            MOV, MPEG, AVI, MP4, 3GP, WMV, эсвэл FLV (5120 MB-ээс ихгүй).
          </p>
        </div>
      </div>
    </motion.div>
  );
}
