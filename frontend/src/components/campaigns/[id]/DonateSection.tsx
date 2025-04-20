'use client';

import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import DonateButton from '@/components/SharedComponents/DonateButton';
import { Campaign } from '@/app/interfaces';

interface DonateSectionProps {
  campaign: Campaign;
  isOwner: boolean;
}

export default function DonateSection({
  campaign,
  isOwner,
}: DonateSectionProps) {
  const nowSec = Math.floor(Date.now() / 1000);
  const timeLeftSec = campaign.deadline - nowSec;

  const goalReached = campaign.raisedWei >= campaign.goalWei;

  const timeLeftText =
    timeLeftSec <= 0
      ? 'Хугацаа дууссан'
      : `${Math.floor(timeLeftSec / 86400)} өдөр ${Math.floor(
          (timeLeftSec % 86400) / 3600
        )} цаг ${Math.floor(((timeLeftSec % 86400) % 3600) / 60)} мин үлдлээ`;

  const progressPercent =
    campaign.goalMnt > 0
      ? Math.min((campaign.raisedMnt / campaign.goalMnt) * 100, 100).toFixed(0)
      : '0';

  return (
    <div className='bg-white shadow rounded-lg p-4'>
      <h3 className='text-xl font-semibold text-gray-800 mb-2'>
        Хандивын мэдээлэл
      </h3>

      <Progress
        value={parseFloat(progressPercent)}
        className='my-2 bg-gray-200'
      />

      <div className='text-sm text-gray-800 flex justify-between'>
        <span>
          Зорилго: <strong>{campaign.goalMnt.toLocaleString()}₮</strong>
        </span>
        <span>
          Цугласан:{' '}
          <strong className='text-blue-600'>
            {campaign.raisedMnt.toLocaleString()}₮
          </strong>
        </span>
      </div>

      <p className='text-sm text-gray-600 mt-2'>
        Төслийн үлдсэн хугацаа:{' '}
        <strong className='text-blue-600'>{timeLeftText}</strong>
      </p>

      {campaign.isActive ? (
        <DonateButton
          campaignId={campaign.id}
          className='w-full py-2 bg-blue-600 hover:bg-blue-500 text-white mt-3'
        />
      ) : (
        <p className='text-red-500 font-medium mt-3'>
          Энэ кампанит ажил хаагдсан байна
        </p>
      )}

      {isOwner && campaign.isActive && goalReached && (
        <div className='mt-4'>
          <a href={`/campaigns/${campaign.id}/withdraw`}>
            <Button
              variant='outline'
              className='text-blue-600 border-blue-600 hover:bg-blue-100 w-full'
            >
              Хөрөнгө татах
            </Button>
          </a>
        </div>
      )}

      {isOwner && !campaign.isActive && campaign.wasGoalReached && (
        <div className='mt-4'>
          <a href={`/campaigns/${campaign.id}/report`}>
            <Button
              variant='outline'
              className='text-blue-600 border-blue-600 hover:bg-blue-100 w-full'
            >
              Тайлан гаргах
            </Button>
          </a>
        </div>
      )}
    </div>
  );
}
