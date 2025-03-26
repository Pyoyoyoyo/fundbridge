'use client';

interface Metadata {
  story?: {
    introduceProject?: string;
    storyDetail?: string;
    risks?: string;
    faq?: string;
  };
}

export default function DetailTab({ metadata }: { metadata: Metadata | null }) {
  return (
    <div className='leading-relaxed text-gray-700 space-y-3'>
      <h4 className='font-semibold text-gray-800 text-lg mb-2'>Төслийн түүх</h4>
      <p>{metadata?.story?.storyDetail || '—'}</p>

      <h4 className='font-semibold text-gray-800 text-lg mt-4'>
        Нэмэлт мэдээлэл
      </h4>
      <p>
        {metadata?.story?.introduceProject ||
          'Энэ төслийн талаар дэлгэрэнгүй мэдээлэл одоогоор алга байна.'}
      </p>
    </div>
  );
}
