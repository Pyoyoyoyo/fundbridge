'use client';

interface RewardItem {
  name: string;
  description: string;
  image?: string;
}
interface Metadata {
  rewards?: {
    items?: RewardItem[];
    description?: string;
  };
}

export default function RewardsTab({
  metadata,
}: {
  metadata: Metadata | null;
}) {
  const rewards = metadata?.rewards;

  return (
    <div className='leading-relaxed text-gray-700 space-y-3'>
      <h4 className='font-semibold text-gray-800 text-lg mb-2'>
        Урамшууллын мэдээлэл
      </h4>
      <p>
        {rewards?.description || 'Урамшууллын мэдээлэл одоогоор алга байна.'}
      </p>

      {rewards?.items && rewards.items.length > 0 ? (
        <ul className='mt-2 space-y-3'>
          {rewards.items.map((item, idx) => (
            <li
              key={idx}
              className='border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors'
            >
              <h5 className='font-semibold mb-1'>{item.name}</h5>
              <p className='text-sm text-gray-600 mb-2'>{item.description}</p>
              {item.image && (
                <img
                  src={item.image}
                  alt={item.name}
                  className='rounded-lg object-cover h-auto w-full transition-transform duration-300 hover:scale-105'
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      '/images/no-image.png';
                  }}
                />
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className='text-sm text-gray-500'>
          Урамшууллын жагсаалт алга байна.
        </p>
      )}
    </div>
  );
}
