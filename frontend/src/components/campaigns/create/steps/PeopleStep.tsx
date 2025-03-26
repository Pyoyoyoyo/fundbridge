'use client';

import { useEffect, ChangeEvent } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Trash2,
  UserPlus,
  Image as ImageIcon,
  Link as LinkIcon,
  Users,
} from 'lucide-react';

import peopleIllustration from '@img/campaign/people-illustration.svg';
import { Collaborator, PeopleData } from '@/app/interfaces';

interface PeopleStepProps {
  formData: {
    people?: PeopleData;
  };
  updateFormData: (data: { people: PeopleData }) => void;
}

export default function PeopleStep({
  formData,
  updateFormData,
}: PeopleStepProps) {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Эхлээд formData.people байхгүй бол default утга
  const peopleData: PeopleData = formData.people ?? {
    vanityURL: '',
    demographics: '',
    collaborators: [],
  };

  // formData-д өөрчлөлт оруулах туслах функц
  function handleChange(fields: Partial<PeopleData>) {
    updateFormData({
      people: {
        ...peopleData,
        ...fields,
      },
    });
  }

  // (1) Хамтрагч нэмж оруулах
  function handleAddCollaborator() {
    const newCollab: Collaborator = {
      name: '',
      position: '',
      imageUrl: '',
    };
    const updated = [...peopleData.collaborators, newCollab];
    handleChange({ collaborators: updated });
  }

  // (2) Хамтрагч устгах
  function handleRemoveCollaborator(index: number) {
    const updated = [...peopleData.collaborators];
    updated.splice(index, 1);
    handleChange({ collaborators: updated });
  }

  // (3) Хамтрагчийн талбарыг өөрчлөх
  function handleCollaboratorChange(
    index: number,
    field: keyof Collaborator,
    value: string
  ) {
    const updated = [...peopleData.collaborators];
    updated[index] = { ...updated[index], [field]: value };
    handleChange({ collaborators: updated });
  }

  // (4) Хамтрагчийн зургийг Pinata/IPFS рүү upload
  async function handleCollaboratorImageUpload(
    index: number,
    e: ChangeEvent<HTMLInputElement>
  ) {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    try {
      // 1) formData бэлтгэх
      const formData = new FormData();
      formData.append('file', file);

      // 2) Pinata руу илгээх (fetch('/api/pinataUploadImage', ...))
      const res = await fetch('/api/pinataUploadImage', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to upload image to IPFS');
      }

      // 3) IPFS URL авах
      const { ipfsUrl } = await res.json();

      // 4) formData-д collaborator-ийн imageUrl шинэчлэх
      const updated = [...peopleData.collaborators];
      updated[index] = { ...updated[index], imageUrl: ipfsUrl };
      handleChange({ collaborators: updated });

      alert('Хамтрагчийн зураг амжилттай IPFS-д байршууллаа!');
    } catch (err: any) {
      console.error('Collaborator image upload error:', err);
      alert('Зураг upload алдаа: ' + err.message);
    }
  }

  // Хэрэглэгч нэвтрээгүй бол login руу чиглүүлэх (жишээ)
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
          <span>People / Багийн мэдээлэл</span>
        </div>
        <p className='text-gray-600'>
          Төслийн баг, хамт олон болон хувь хүний мэдээллийг эндээс тохируулна
          уу.
        </p>
      </div>

      {/* Form талбарууд */}
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

        {/* Collaborators массив */}
        <div className='space-y-2'>
          <label className='flex items-center gap-1 font-medium text-gray-700'>
            <UserPlus className='w-4 h-4 text-gray-500' />
            Collaborators
          </label>

          {/* Add товч */}
          <Button variant='outline' onClick={handleAddCollaborator}>
            <UserPlus className='w-4 h-4 mr-2' />
            Хамтрагч нэмэх
          </Button>

          {/* Хамтрагчдын жагсаалт (динамик) */}
          <div className='space-y-4 mt-2'>
            {peopleData.collaborators.map((collab, index) => (
              <div
                key={index}
                className='border border-gray-300 p-3 rounded-md space-y-2 relative'
              >
                {/* Устгах товч */}
                <button
                  type='button'
                  className='absolute top-2 right-2 text-gray-400 hover:text-red-500'
                  onClick={() => handleRemoveCollaborator(index)}
                >
                  <Trash2 className='w-4 h-4' />
                </button>

                <div className='flex gap-4'>
                  {/* Name */}
                  <div className='w-1/2'>
                    <label className='text-sm font-medium text-gray-700'>
                      Нэр
                    </label>
                    <Input
                      placeholder='Жишээ: John Doe'
                      value={collab.name}
                      onChange={(e) =>
                        handleCollaboratorChange(index, 'name', e.target.value)
                      }
                    />
                  </div>

                  {/* Position */}
                  <div className='w-1/2'>
                    <label className='text-sm font-medium text-gray-700'>
                      Албан тушаал
                    </label>
                    <Input
                      placeholder='Жишээ: Developer, Designer...'
                      value={collab.position}
                      onChange={(e) =>
                        handleCollaboratorChange(
                          index,
                          'position',
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>

                {/* Image upload */}
                <div className='space-y-1'>
                  <label className='text-sm font-medium text-gray-700 flex items-center gap-1'>
                    <ImageIcon className='w-4 h-4 text-gray-500' />
                    Зураг (IPFS)
                  </label>

                  {/* File input for uploading */}
                  <input
                    type='file'
                    accept='image/*'
                    onChange={(e) => handleCollaboratorImageUpload(index, e)}
                  />

                  {collab.imageUrl && (
                    <div className='mt-2 flex items-center gap-2'>
                      <img
                        src={collab.imageUrl}
                        alt='Preview'
                        className='h-16 w-16 object-cover rounded'
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            '/images/no-image.png';
                        }}
                      />
                      <p className='text-sm text-gray-500'>
                        Урьдчилсан харагдац
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
