'use client';

import { motion } from 'framer-motion';
import {
  BookOpen,
  Info,
  FileText,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react';
import Image from 'next/image';
import { Textarea } from '@/components/ui/textarea';

import storyIllustration from '@img/campaign/story-illustration.svg';

interface StoryStepProps {
  formData: {
    story?: StoryData;
  };
  updateFormData: (data: { story: StoryData }) => void;
}

interface StoryData {
  introduceProject: string;
  storyDetail: string;
  risks: string;
  faq: string;
}

export default function StoryStep({
  formData,
  updateFormData,
}: StoryStepProps) {
  const storyData: StoryData = formData.story ?? {
    introduceProject: '',
    storyDetail: '',
    risks: '',
    faq: '',
  };

  function handleChange(fields: Partial<StoryData>) {
    updateFormData({
      story: {
        ...storyData,
        ...fields,
      },
    });
  }

  return (
    <motion.div
      className='flex flex-col gap-8 p-6 bg-white rounded shadow'
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
    >
      {/* Дээд талд иллюстрац, гарчиг, товч тайлбар */}
      <div className='flex flex-col items-center text-center space-y-4'>
        <Image
          src={storyIllustration}
          alt='Story illustration'
          width={760}
          height={100}
        />
        <div className='flex items-center gap-2 text-xl font-semibold text-blue-600'>
          <BookOpen className='w-6 h-6' />
          <span>Төслийн дэлгэрэнгүй (Story)</span>
        </div>
        <p className='text-gray-600 max-w-xl mx-auto'>
          Төслийн зорилго, агуулга, хэрэгжилтийн төлөвлөгөө, бусдад үзүүлэх ач
          холбогдлыг энд тодорхой бичиж, дэмжигчдэдээ танилцуулна уу.
        </p>
      </div>

      {/* Доод талд: Нэг баганатай форм */}
      <div className='flex flex-col space-y-6'>
        {/* 1. Төслөө танилцуул */}
        <div className='space-y-2'>
          <label className='flex items-center gap-1 text-lg font-semibold text-gray-800'>
            <Info className='w-5 h-5 text-gray-500' />
            1. Төслөө танилцуул
          </label>
          <Textarea
            placeholder='Төслийн ерөнхий танилцуулга...'
            value={storyData.introduceProject ?? ''}
            onChange={(e) => handleChange({ introduceProject: e.target.value })}
            className='h-32'
          />
        </div>

        {/* 2. Төслийн түүх */}
        <div className='space-y-2'>
          <label className='flex items-center gap-1 text-lg font-semibold text-gray-800'>
            <FileText className='w-5 h-5 text-gray-500' />
            2. Төслийн түүх
          </label>
          <Textarea
            placeholder='Төслийн дэлгэрэнгүй түүх, үзэл санаа...'
            value={storyData.storyDetail ?? ''}
            onChange={(e) => handleChange({ storyDetail: e.target.value })}
            className='h-32'
          />
        </div>

        {/* 3. Эрсдэл ба сорилтууд */}
        <div className='space-y-2'>
          <label className='flex items-center gap-1 text-lg font-semibold text-gray-800'>
            <AlertTriangle className='w-5 h-5 text-gray-500' />
            3. Эрсдэл ба сорилтууд
          </label>
          <Textarea
            placeholder='Эрсдэл, сорилтууд, шийдвэрлэх арга зам...'
            value={storyData.risks ?? ''}
            onChange={(e) => handleChange({ risks: e.target.value })}
            className='h-32'
          />
        </div>

        {/* 4. FAQ */}
        <div className='space-y-2'>
          <label className='flex items-center gap-1 text-lg font-semibold text-gray-800'>
            <HelpCircle className='w-5 h-5 text-gray-500' />
            4. Түгээмэл асуулт, хариулт (FAQ)
          </label>
          <Textarea
            placeholder='FAQ - асуулт, хариултууд...'
            value={storyData.faq ?? ''}
            onChange={(e) => handleChange({ faq: e.target.value })}
            className='h-32'
          />
        </div>
      </div>
    </motion.div>
  );
}
