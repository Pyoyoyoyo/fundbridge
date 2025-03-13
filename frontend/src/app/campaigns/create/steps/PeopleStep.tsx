'use client';

import { useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

/** Компонентын проп */
interface PeopleStepProps {
  formData: {
    people?: PeopleData; // people байхгүй байж болзошгүй тул ? ашигласан
  };
  updateFormData: (data: { people: PeopleData }) => void;
}

/** PeopleStep доторх өгөгдлийн бүтэц */
interface PeopleData {
  vanityURL: string;
  demographics: string;
  collaborators: string;
  // Шаардлагатай бол бусад талбар
}

export default function PeopleStep({
  formData,
  updateFormData,
}: PeopleStepProps) {
  const router = useRouter();
  const { data: session, status } = useSession();

  /**
   * formData.people байхгүй тохиолдолд,
   * vanityURL, demographics, collaborators талбаруудыг хоосон мөрөөр fallback өгнө.
   */
  const peopleData: PeopleData = formData.people ?? {
    vanityURL: '',
    demographics: '',
    collaborators: '',
  };

  /**
   * Оролт талбарууд өөрчлөгдөх бүрт parent-ийн formData-д update хийж,
   * “controlled” горимоор утгыг дамжуулах
   */
  function handleChange(fields: Partial<PeopleData>) {
    updateFormData({
      people: {
        ...peopleData,
        ...fields,
      },
    });
  }

  useEffect(() => {
    // Жишээ нь, хэрэв session байхгүй бол login руу шилжүүлэх
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  return (
    <div className='space-y-4 bg-white p-6 rounded shadow'>
      <h2 className='text-xl font-semibold text-gray-800'>
        People / Хувийн мэдээлэл
      </h2>
      <p className='text-sm text-gray-600'>
        Төслийн баг, хамт олон болон хувь хүний мэдээллийг эндээс тохируулна уу.
      </p>

      <div className='space-y-2'>
        <label className='block text-sm font-medium text-gray-700'>
          Vanity URL
        </label>
        <Input
          placeholder='https://kickstarter.com/profile/...'
          value={peopleData.vanityURL ?? ''} // fallback
          onChange={(e) => handleChange({ vanityURL: e.target.value })}
        />
      </div>

      <div className='space-y-2'>
        <label className='block text-sm font-medium text-gray-700'>
          Demographics
        </label>
        <Textarea
          placeholder='Таны нас, гарал үүсэл, бусад онцлог... (заавал биш)'
          value={peopleData.demographics ?? ''} // fallback
          onChange={(e) => handleChange({ demographics: e.target.value })}
        />
      </div>

      <div className='space-y-2'>
        <label className='block text-sm font-medium text-gray-700'>
          Collaborators
        </label>
        <Textarea
          placeholder='Хамтрагчид, багийн гишүүдийн танилцуулга...'
          value={peopleData.collaborators ?? ''} // fallback
          onChange={(e) => handleChange({ collaborators: e.target.value })}
        />
      </div>
    </div>
  );
}
