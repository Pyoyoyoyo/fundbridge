'use client';

import { Collaborator } from '@/app/interfaces';

interface PeopleTabProps {
  metadata?: {
    people?: {
      vanityURL?: string;
      demographics?: string;
      collaborators?: Collaborator[];
    };
  };
}

export default function PeopleTab({ metadata }: PeopleTabProps) {
  const people = metadata?.people;

  return (
    <div className='leading-relaxed text-gray-700 space-y-4'>
      <h4 className='font-semibold text-gray-800 text-lg'>Төслийн баг</h4>

      <p className='text-sm text-gray-700'>
        <strong>Vanity URL:</strong> {people?.vanityURL || '—'}
      </p>
      <p className='text-sm text-gray-700'>
        <strong>Demographics:</strong> {people?.demographics || '—'}
      </p>

      {people?.collaborators && people.collaborators.length > 0 ? (
        <div className='mt-4 space-y-3'>
          {people.collaborators.map((collab, i) => (
            <div
              key={i}
              className='flex items-center gap-4 border p-3 rounded-md'
            >
              {/* Зураг */}
              {collab.imageUrl ? (
                <img
                  src={collab.imageUrl}
                  alt={collab.name}
                  className='w-16 h-16 object-cover rounded'
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      '/images/no-image.png';
                  }}
                />
              ) : (
                <div className='w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-gray-500'>
                  No Img
                </div>
              )}

              <div>
                <p className='font-medium text-gray-800'>{collab.name}</p>
                <p className='text-sm text-gray-600'>{collab.position}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className='text-sm text-gray-500'>
          Хамтрагчдын мэдээлэл алга байна.
        </p>
      )}
    </div>
  );
}
