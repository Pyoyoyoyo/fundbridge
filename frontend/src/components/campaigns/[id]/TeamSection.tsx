'use client';

import TeamCard from './tabs/TeamCard';

interface TeamSectionProps {
  metadata: any;
  onFAQClick?: () => void; // <-- Энийг props болгож зөв бичсэн байна
}

export default function TeamSection({
  metadata,
  onFAQClick,
}: TeamSectionProps) {
  const collaborators = metadata?.people?.collaborators || [];

  return (
    <div className='space-y-6'>
      {/* Багийн гишүүдийн хэсэг */}
      <TeamCard
        collaborators={
          metadata?.people?.collaborators ? metadata.people.collaborators : []
        }
      />

      {/* FAQ + Гомдол хэсэг */}
      <div className='bg-white shadow rounded-lg p-6'>
        <h3 className='text-xl font-semibold text-gray-800 mb-4'>
          Тусламж ба Холбоо
        </h3>
        <p className='text-gray-700 text-sm mb-3'>
          Хэрэв танд төслийн талаар асуулт байвал&nbsp;
          <button
            onClick={onFAQClick} // <-- энд зөв props-оор ирсэн функц дуудагдана
            className='text-blue-600 underline hover:text-blue-800 transition'
          >
            FAQ
          </button>
          &nbsp;хэсгээс харна уу.
        </p>
        <button
          onClick={() => alert('Гомдол мэдүүлэх процесс ажиллаж байна...')}
          className='text-sm text-red-600 underline hover:text-red-800 transition'
        >
          Гомдол мэдүүлэх
        </button>
      </div>
    </div>
  );
}
