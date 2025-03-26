import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Campaign } from '@/app/interfaces/campaign/campaignData';

export function CampaignCard({
  campaign,
  currentUser,
}: {
  campaign: Campaign;
  currentUser: string | null;
}) {
  // Прогресс %
  const progressPercent =
    campaign.goalMnt > 0
      ? Math.min((campaign.raisedMnt / campaign.goalMnt) * 100, 100).toFixed(0)
      : '0';

  // Owner мөн эсэх
  const isOwner =
    currentUser &&
    currentUser.toLowerCase() === (campaign.owner || '').toLowerCase();

  return (
    <Card className='bg-gray-100 shadow-lg hover:shadow-xl transition-shadow'>
      {campaign.imageUrl && (
        <img
          src={campaign.imageUrl}
          alt={campaign.title}
          className='h-40 w-full object-cover rounded-t-lg'
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = '/images/no-image.png';
          }}
        />
      )}
      <CardHeader className='bg-blue-100 text-blue-600 p-4'>
        <CardTitle>{campaign.title}</CardTitle>
      </CardHeader>
      <CardContent className='p-4'>
        <p className='text-sm text-gray-600 mb-1'>
          <strong className='text-blue-600'>
            {campaign.primaryCategory || 'Хандив'}
          </strong>
        </p>

        <p className='text-gray-900 mb-2'>{campaign.description}</p>

        {/* Progress bar */}
        <Progress
          value={parseFloat(progressPercent)}
          className='my-3 bg-gray-300'
        />
        <div className='mb-3 flex justify-between text-sm text-gray-900'>
          <span>
            Зорилго:{' '}
            <strong className='text-blue-600'>
              {campaign.goalMnt.toLocaleString()}₮
            </strong>
          </span>
          <span>
            Цугласан:{' '}
            <strong className='text-blue-600'>
              {campaign.raisedMnt.toLocaleString()}₮
            </strong>
          </span>
        </div>

        {/* Дэлгэрэнгүй линк */}
        <Link href={`/campaigns/${campaign.id}`}>
          <Button
            variant='outline'
            className='text-blue-600 border-blue-600 hover:bg-blue-100 w-full mb-3'
          >
            Дэлгэрэнгүй
          </Button>
        </Link>
        {/* Хэрэв эзэмшигч бол "Засах" товч, эзэмшигч биш бол юу ч харуулахгүй */}
        {isOwner && (
          <Link href={`/campaigns/${campaign.id}/edit`}>
            <Button className='bg-blue-600 text-white hover:bg-blue-500 w-full'>
              Засах
            </Button>
          </Link>
        )}
        {/* Эзэмшигч мөн бол */}
        {isOwner && (
          <p className='mt-3 text-sm text-green-600 font-medium'>
            Та энэ кампанит ажлын эзэмшигч байна.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
