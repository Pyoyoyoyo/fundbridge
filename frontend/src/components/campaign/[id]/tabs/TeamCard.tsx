'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';

/**
 * Төслийн багийн нэг гишүүн Collaborator‐ийн интерфэйс
 */
interface Collaborator {
  name: string;
  position: string;
  imageUrl: string;
}

/**
 * TeamCard компонент нь гаднаас collaborators массивыг props болгон авч харуулна.
 */
export default function TeamCard({
  collaborators,
}: {
  collaborators: Collaborator[];
}) {
  return (
    <motion.div
      className='bg-white shadow rounded-lg'
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className='text-lg font-semibold'>Төслийн баг</CardTitle>
        </CardHeader>

        <CardContent>
          <div className='space-y-4'>
            {/* Хэрэв collaborators хоосон бол '—' эсвэл өөр placeholder харуулах */}
            {collaborators && collaborators.length > 0 ? (
              collaborators.map((col, i) => (
                <div key={i} className='flex items-center gap-3'>
                  <img
                    src={col.imageUrl}
                    alt={col.name}
                    className='w-10 h-10 rounded-full object-cover'
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        '/images/no-image.png';
                    }}
                  />
                  <div>
                    <p className='text-sm font-medium text-gray-800'>
                      {col.name}
                    </p>
                    <p className='text-xs text-gray-500'>{col.position}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className='text-sm text-gray-500'>Багийн гишүүд алга байна.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
