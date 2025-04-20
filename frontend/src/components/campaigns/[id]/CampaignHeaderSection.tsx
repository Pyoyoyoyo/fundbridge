'use client';

import { motion } from 'framer-motion';
import { Campaign } from '@/app/interfaces';

interface CampaignHeaderSectionProps {
  campaign: Campaign;
  isOwner: boolean;
}

export default function CampaignHeaderSection({
  campaign,
  isOwner,
}: CampaignHeaderSectionProps) {
  return (
    <motion.div
      className='bg-white shadow-lg rounded-lg p-4'
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className='text-2xl font-bold text-gray-800'>{campaign.title}</h1>
      <p className='text-sm text-blue-600'>{campaign.primaryCategory}</p>
      <p className='text-gray-700 mt-2 leading-relaxed'>
        {campaign.description}
      </p>

      {campaign.imageUrl && (
        <div className='mt-3 rounded overflow-hidden'>
          <motion.img
            src={campaign.imageUrl}
            alt='Campaign Image'
            className='w-full h-auto object-cover transition-transform duration-300 hover:scale-105'
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                '/images/no-image.png';
            }}
          />
        </div>
      )}

      {isOwner && (
        <p className='mt-3 text-sm text-green-600 font-medium'>
          Та энэ кампанит ажлын эзэмшигч байна.
        </p>
      )}
    </motion.div>
  );
}
