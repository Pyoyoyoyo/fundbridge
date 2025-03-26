'use client';

interface Metadata {
  story?: {
    risks?: string;
  };
}

export default function RisksTab({ metadata }: { metadata: Metadata | null }) {
  return (
    <div className='leading-relaxed text-gray-700 space-y-3'>
      <h4 className='font-semibold text-gray-800 text-lg mb-2'>
        Эрсдэл ба сорилтууд
      </h4>
      <p>
        {metadata?.story?.risks ||
          'Энэ төслийн эрсдэл болон сорилтуудын мэдээлэл алга байна.'}
      </p>
    </div>
  );
}
