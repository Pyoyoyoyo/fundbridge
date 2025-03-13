'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { BrowserProvider, ethers } from 'ethers';

// Marketplace гэрээтэй холбогдох service/файл
import { getMarketplaceContract } from '@/services/marketplaceConfig';
// Fundraising гэрээтэй холбогдох service/файл
import { getFundraisingContract } from '@/services/contractConfig';

interface CampaignInfo {
  id: number;
  title: string;
}

export default function MarketplaceItemCreatePage() {
  const router = useRouter();

  // Form талбарууд
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(''); // MNT
  const [image, setImage] = useState<string | null>(null);

  // Кампанит ажлын drop-down
  const [campaigns, setCampaigns] = useState<CampaignInfo[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1) Кампанит ажлуудыг татаж, drop-down дээр үзүүлнэ
  useEffect(() => {
    async function fetchCampaigns() {
      try {
        if (!(window as any).ethereum) {
          console.warn('MetaMask not found');
          return;
        }
        const provider = new BrowserProvider((window as any).ethereum);
        await provider.send('eth_requestAccounts', []);
        const signer = await provider.getSigner();

        const fundraising = getFundraisingContract(signer);
        const data = await fundraising.getAllCampaigns();
        // data[i] = [id, owner, title, description, goal, raised, isActive, imageUrl, metadataHash]
        const parsed = data.map((c: any) => ({
          id: Number(c[0]),
          title: c[2],
        }));
        setCampaigns(parsed);
      } catch (err) {
        console.error('Failed to fetch campaigns:', err);
        setError('Кампанит ажлуудыг татахад алдаа гарлаа.');
      }
    }
    fetchCampaigns();
  }, []);

  // Зураг сонгох
  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        setImage(result);
      };
      reader.readAsDataURL(file);
    }
  }

  // Item үүсгэх
  async function handleCreateItem() {
    try {
      setLoading(true);
      setError(null);

      if (!window.ethereum) {
        alert('MetaMask not found!');
        return;
      }
      const provider = new BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const contract = getMarketplaceContract(signer);

      // Үнэ шалгах
      const priceNumber = parseInt(price, 10);
      if (isNaN(priceNumber) || priceNumber <= 0) {
        alert('Үнэ талбарт зөв тоон утга оруулна уу!');
        return;
      }
      // Кампанит ажил сонгосон эсэх
      if (!selectedCampaignId) {
        alert('Кампанит ажил сонгоогүй байна!');
        return;
      }

      // (Mock) гэрээ дуудах
      console.log('Creating item with:', {
        title,
        description,
        priceNumber,
        campaignId: selectedCampaignId,
        image,
      });

      const tx = await contract.createItem(
        title,
        description,
        priceNumber,
        Number(selectedCampaignId),
        image || ''
      );
      await tx.wait();

      alert('Item амжилттай үүслээ!');
      router.push('/marketplace');
    } catch (err) {
      console.error(err);
      alert('Алдаа гарлаа: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='min-h-screen bg-gradient-to-b from-white to-blue-50 p-8 flex flex-col items-center'>
      <div className='w-full max-w-lg bg-white shadow-lg rounded-lg p-6 animate-in fade-in'>
        <h1 className='text-2xl font-bold text-gray-800 mb-6 text-center'>
          <span className='text-blue-600'>Item</span> зарах
        </h1>

        {error && (
          <div className='mb-4 p-3 border border-red-300 bg-red-50 text-red-600 rounded'>
            {error}
          </div>
        )}

        <div className='space-y-4'>
          {/* Title */}
          <div>
            <label className='mb-1 block text-sm font-medium text-gray-700'>
              Нэр (title)
            </label>
            <Input
              type='text'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className='border border-gray-300 rounded w-full'
              placeholder='Жишээ: Ухаалаг цаг'
            />
          </div>

          {/* Description */}
          <div>
            <label className='mb-1 block text-sm font-medium text-gray-700'>
              Тайлбар (description)
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className='border border-gray-300 rounded w-full'
              placeholder='Энэ item ямар онцлогтой, ямар учиртайг тайлбарла...'
            />
          </div>

          {/* Price (MNT) */}
          <div>
            <label className='mb-1 block text-sm font-medium text-gray-700'>
              Үнэ (MNT)
            </label>
            <Input
              type='number'
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className='border border-gray-300 rounded w-full'
              placeholder='100000'
            />
          </div>

          {/* Кампанит ажил сонгох (DropDown) */}
          <div>
            <label className='mb-1 block text-sm font-medium text-gray-700'>
              Хандив өгөх кампанит ажил
            </label>
            <select
              value={selectedCampaignId}
              onChange={(e) => setSelectedCampaignId(e.target.value)}
              className='
                border border-gray-300 rounded w-full p-2 
                focus:outline-none focus:ring-2 focus:ring-blue-500 
                transition-colors
              '
            >
              <option value=''>Кампанит ажил сонгох</option>
              {campaigns.map((c) => (
                <option key={c.id} value={c.id.toString()}>
                  {c.title} (ID: {c.id})
                </option>
              ))}
            </select>
          </div>

          {/* Image file */}
          <div>
            <label className='mb-1 block text-sm font-medium text-gray-700'>
              Зургийн файл
            </label>
            {image && (
              <div className='mb-2 rounded overflow-hidden'>
                <img
                  src={image}
                  alt='Preview'
                  className='h-40 w-full object-cover rounded shadow-sm'
                />
              </div>
            )}
            <Input type='file' accept='image/*' onChange={handleImageUpload} />
          </div>

          {/* Create button */}
          <Button
            onClick={handleCreateItem}
            disabled={loading}
            className='
              bg-blue-600 hover:bg-blue-500 text-white w-full 
              font-semibold py-2
              transition-colors
            '
          >
            {loading ? 'Үүсгэж байна...' : 'Үүсгэх'}
          </Button>
        </div>
      </div>
    </div>
  );
}
