'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link as LinkIcon, Users, UserPlus } from 'lucide-react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import peopleIllustration from '@img/campaign/people-illustration.svg';

interface PeopleStepProps {
  formData: {
    people?: PeopleData;
  };
  updateFormData: (data: { people: PeopleData }) => void;
}

interface PeopleData {
  vanityURL: string;
  demographics: string;
  collaborators: string;
}

export default function PeopleStep({
  formData,
  updateFormData,
}: PeopleStepProps) {
  const router = useRouter();
  const { data: session, status } = useSession();

  const peopleData: PeopleData = formData.people ?? {
    vanityURL: '',
    demographics: '',
    collaborators: '',
  };

  function handleChange(fields: Partial<PeopleData>) {
    updateFormData({
      people: {
        ...peopleData,
        ...fields,
      },
    });
  }

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  return (
    <motion.div
      className='flex flex-col gap-8 p-6 bg-white rounded shadow'
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
    >
      {/* Дээд талд иллюстрац, гарчиг, товч тайлбар */}
      <div className='flex flex-col items-center text-center space-y-4'>
        <Image
          src={peopleIllustration}
          alt='People illustration'
          width={760}
          height={100}
        />
        <div className='flex items-center gap-2 text-xl font-semibold text-blue-600'>
          <Users className='w-6 h-6' />
          <span>People / Хувийн мэдээлэл</span>
        </div>
        <p className='text-gray-600'>
          Төслийн баг, хамт олон болон хувь хүний мэдээллийг эндээс тохируулна
          уу.
        </p>
      </div>

      {/* Доод талд: Нэг баганатай форм */}
      <div className='flex flex-col space-y-6'>
        {/* Vanity URL */}
        <div className='space-y-2'>
          <label className='flex items-center gap-1 font-medium text-gray-700'>
            <LinkIcon className='w-4 h-4 text-gray-500' />
            Vanity URL
          </label>
          <Input
            placeholder='https://kickstarter.com/profile/...'
            value={peopleData.vanityURL}
            onChange={(e) => handleChange({ vanityURL: e.target.value })}
          />
        </div>

        {/* Demographics */}
        <div className='space-y-2'>
          <label className='flex items-center gap-1 font-medium text-gray-700'>
            <Users className='w-4 h-4 text-gray-500' />
            Demographics
          </label>
          <Textarea
            placeholder='Таны нас, гарал үүсэл, бусад онцлог... (заавал биш)'
            value={peopleData.demographics}
            onChange={(e) => handleChange({ demographics: e.target.value })}
          />
        </div>

        {/* Collaborators */}
        <div className='space-y-2'>
          <label className='flex items-center gap-1 font-medium text-gray-700'>
            <UserPlus className='w-4 h-4 text-gray-500' />
            Collaborators
          </label>
          <Textarea
            placeholder='Хамтрагчид, багийн гишүүдийн танилцуулга...'
            value={peopleData.collaborators}
            onChange={(e) => handleChange({ collaborators: e.target.value })}
          />
        </div>
      </div>
    </motion.div>
  );
}
