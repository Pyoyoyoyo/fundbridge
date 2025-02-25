'use client';

import { useState } from 'react';
import { BrowserProvider } from 'ethers';
import { getFundraisingContract } from '@/services/contractConfig';

export default function CreateCampaignPage() {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [goal, setGoal] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  // form validation-ийн хувьд энгийн шалгалт хийе:
  function validateForm() {
    if (!title || !desc || !goal) {
      alert('Бүх талбарыг бөглөнө үү!');
      return false;
    }
    if (parseInt(goal) <= 0) {
      alert('Зорилтот дүн 0-с их байх ёстой!');
      return false;
    }
    return true;
  }

  async function handleCreate() {
    if (!validateForm()) return;

    try {
      setLoading(true);
      // MetaMask холбох
      if (!window.ethereum) {
        alert('MetaMask олдсонгүй. Та MetaMask суулгасан эсэхээ шалгана уу.');
        return;
      }

      const provider = new BrowserProvider(window.ethereum);
      // Хэрэглэгчийн дансыг асууна
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();

      const contract = getFundraisingContract(signer);

      const tx = await contract.createCampaign(title, desc, parseInt(goal));
      await tx.wait();

      alert('Кампанит ажил амжилттай үүслээ!');
      // Талбаруудыг цэвэрлэх
      setTitle('');
      setDesc('');
      setGoal('');
      setImageUrl('');
    } catch (error) {
      console.error(error);
      alert('Алдаа гарлаа: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <h1 className='mb-4 text-2xl font-semibold text-gray-800'>
        Кампанит ажил үүсгэх
      </h1>

      <div className='max-w-md space-y-4'>
        <div>
          <label className='mb-1 block text-sm font-medium text-gray-700'>
            Гарчиг
          </label>
          <input
            type='text'
            className='w-full rounded border border-gray-300 px-3 py-2 focus:outline-none'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder='Жишээ: Clean Water Project'
          />
        </div>

        <div>
          <label className='mb-1 block text-sm font-medium text-gray-700'>
            Тайлбар
          </label>
          <textarea
            className='w-full rounded border border-gray-300 px-3 py-2 focus:outline-none'
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder='Кампанит ажлын зорилго, үйл ажиллагаа...'
          />
        </div>

        <div>
          <label className='mb-1 block text-sm font-medium text-gray-700'>
            Зорилтот дүн (MNT)
          </label>
          <input
            type='number'
            className='w-full rounded border border-gray-300 px-3 py-2 focus:outline-none'
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder='100000'
          />
        </div>

        <div>
          <label className='mb-1 block text-sm font-medium text-gray-700'>
            Зургийн холбоос (image URL)
          </label>
          <input
            type='text'
            className='w-full rounded border border-gray-300 px-3 py-2 focus:outline-none'
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder='https://example.com/campaign.jpg'
          />
          <p className='mt-1 text-sm text-gray-500'>
            Та энэ талбарыг Marketplace-тэй холбон ашиглаж болно.
          </p>
        </div>

        <button
          onClick={handleCreate}
          disabled={loading}
          className='rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-500 disabled:opacity-50'
        >
          {loading ? 'Үүсгэж байна...' : 'Үүсгэх'}
        </button>
      </div>
    </div>
  );
}
