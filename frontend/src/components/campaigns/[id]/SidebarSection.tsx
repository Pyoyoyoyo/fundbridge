'use client';

import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import DonateButton from '@/components/SharedComponents/DonateButton';
import TeamCard from '@/components/campaigns/[id]/tabs/TeamCard';

interface SidebarSectionProps {
  campaign: {
    id: number;
    goalMnt: number;
    raisedMnt: number;
    goalWei: bigint;
    raisedWei: bigint;
    isActive: boolean;
    wasGoalReached: boolean;
    owner: string;
    deadline: number;
  };
  currentUser: string | null;
  metadata: any;
  onFAQClick: () => void;
}

export default function SidebarSection({
  campaign,
  currentUser,
  metadata,
  onFAQClick,
}: SidebarSectionProps) {
  const isOwner = currentUser === campaign.owner;
  const goalReached = campaign.raisedWei >= campaign.goalWei;

  // Үлдсэн хугацаа тооцоолох
  const nowSec = Math.floor(Date.now() / 1000);
  const timeLeftSec = campaign.deadline - nowSec;
  let timeLeftText = '';
  if (timeLeftSec <= 0) {
    timeLeftText = 'Хугацаа дууссан';
  } else {
    const days = Math.floor(timeLeftSec / 86400);
    const hours = Math.floor((timeLeftSec % 86400) / 3600);
    const minutes = Math.floor(((timeLeftSec % 86400) % 3600) / 60);
    timeLeftText = `${days} өдөр ${hours} цаг ${minutes} мин үлдлээ`;
  }

  const progressPercent =
    campaign.goalMnt > 0
      ? Math.min((campaign.raisedMnt / campaign.goalMnt) * 100, 100).toFixed(0)
      : '0';

  return (
    <div className='space-y-4 lg:sticky lg:top-6 self-start h-fit'>
      {/* Хандивын мэдээлэл */}
      <div className='bg-white shadow rounded-lg p-4'>
        <h3 className='text-xl font-semibold text-gray-800 mb-2'>
          Хандивын мэдээлэл
        </h3>

        <div className='my-2'>
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
        </div>

        <p className='text-sm text-gray-600 mt-2'>
          Төслийн үлдсэн хугацаа:{' '}
          <strong className='text-blue-600'>{timeLeftText}</strong>
        </p>

        {/* Хандив өгөх товч */}
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

        {/* Хөрөнгө татах товч — owner + active + goalReached */}
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

        {/* Тайлан гаргах товч — owner + inactive + goalReached */}
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

      {/* Төслийн баг (Collaborators) */}
      <TeamCard
        collaborators={
          metadata?.people?.collaborators ? metadata.people.collaborators : []
        }
      />

      {/* FAQ + Гомдол */}
      <div className='bg-white shadow rounded-lg p-4'>
        <p className='text-gray-700 text-sm mb-2'>
          Хэрэв танд төслийн талаар асуулт байвал{' '}
          <button onClick={onFAQClick} className='text-blue-600 underline'>
            FAQ
          </button>{' '}
          хэсгээс харна уу.
        </p>
        <button
          onClick={() => alert('Гомдол мэдүүлэх процесс...')}
          className='text-sm text-red-600 underline'
        >
          Гомдол мэдүүлэх
        </button>
      </div>
    </div>
  );
}
