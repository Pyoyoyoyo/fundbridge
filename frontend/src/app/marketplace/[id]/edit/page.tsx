'use client';

import { useEffect, useState, ChangeEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { BrowserProvider, ethers } from 'ethers';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

import { getMarketplaceContract } from '@/services/marketplaceConfig';

// Жишээ ханш: 1 ETH = 6,000,000 MNT
const ETH_TO_MNT_RATE = 6_000_000;

export default function EditItemPage() {
  const router = useRouter();
  const { id } = useParams(); // /marketplace/[id]/edit → id: string|undefined
  const itemId = parseInt(Array.isArray(id) ? id[0] : id ?? '0', 10);

  // Одоогийн item-ийн мэдээлэл
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priceMnt, setPriceMnt] = useState(''); // MNT хэлбэрээр харуулна
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // Loading & Error state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Зураг upload хийж буй эсэх
  const [uploadingImage, setUploadingImage] = useState(false);

  // 1) Хэрэглэгч Metamask‐тай эсэхийг шалгах, гэрээнээс item татах
  useEffect(() => {
    async function fetchItem() {
      try {
        setLoading(true);
        setError(null);

        if (!itemId || isNaN(itemId) || itemId <= 0) {
          throw new Error('itemId буруу байна.');
        }
        if (!window.ethereum) {
          throw new Error('MetaMask not found!');
        }

        const provider = new BrowserProvider(window.ethereum);
        await provider.send('eth_requestAccounts', []);
        const signer = await provider.getSigner();
        const contract = getMarketplaceContract(signer);

        // getItem(itemId)
        const raw = await contract.getItem(itemId);
        // raw = [id, seller, buyer, title, description, price, imageUrl, campaignId, isSold, isActive] (жишээ)
        // эсвэл таны гэрээнд тохируулна
        const itemPriceWei = raw[5]; // price
        const priceEth = parseFloat(ethers.formatEther(itemPriceWei));
        const priceMntNum = Math.floor(priceEth * ETH_TO_MNT_RATE);

        setTitle(raw[3]);
        setDescription(raw[4]);
        setPriceMnt(priceMntNum.toString());
        setImageUrl(raw[6] || null);
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchItem();
  }, [itemId]);

  // 2) Шинэ зургийг сонгоод IPFS рүү upload
  async function handleImageUpload(e: ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    try {
      setUploadingImage(true);

      // 1) Локал preview (түр)
      const localPreview = URL.createObjectURL(file);
      setImageUrl(localPreview);

      // 2) Pinata эсвэл IPFS рүү upload
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/pinataUploadImage', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to upload image');
      }

      const { ipfsUrl } = await res.json();
      // Шинэ imageUrl
      setImageUrl(ipfsUrl);
      alert('Зураг IPFS-д байршууллаа!');
    } catch (err: any) {
      console.error(err);
      alert('Зураг upload алдаа: ' + err.message);
    } finally {
      setUploadingImage(false);
    }
  }

  // 3) Save/update товч дарахад
  async function handleUpdateItem() {
    try {
      setLoading(true);
      setError(null);

      if (!window.ethereum) {
        throw new Error('MetaMask not found!');
      }
      const provider = new BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const contract = getMarketplaceContract(signer);

      // Price (MNT → ETH → wei)
      const priceNum = parseInt(priceMnt.trim(), 10);
      if (isNaN(priceNum) || priceNum <= 0) {
        throw new Error('Үнэ талбарт зөв тоон утга оруулна уу!');
      }
      const priceEthRaw = priceNum / ETH_TO_MNT_RATE;
      const priceEthTrimmed = parseFloat(priceEthRaw.toFixed(18));
      const priceWei = ethers.parseEther(priceEthTrimmed.toString());

      // updateItem(itemId, newTitle, newDesc, newPrice, newImageUrl)
      const tx = await contract.updateItem(
        itemId,
        title,
        description,
        priceWei,
        imageUrl || ''
      );
      await tx.wait();

      alert('Item мэдээлэл амжилттай шинэчлэгдлээ!');
      router.push('/profile/items'); // эсвэл /marketplace
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className='min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white to-blue-50'>
        <Skeleton className='h-40 w-3/4 rounded-md bg-gray-300 animate-pulse' />
        <p className='text-gray-500 mt-2'>Ачааллаж байна...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant='destructive' className='m-4'>
        <AlertTitle>Алдаа</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className='max-w-xl mx-auto p-4 bg-white rounded shadow space-y-6'>
      <h1 className='text-2xl font-bold text-gray-800'>
        Item засах (ID: {itemId})
      </h1>

      <div className='space-y-4'>
        {/* Title */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Нэр (title)
          </label>
          <Input
            type='text'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className='w-full'
          />
        </div>

        {/* Description */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Тайлбар (description)
          </label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className='w-full'
          />
        </div>

        {/* Price (MNT) */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Үнэ (MNT)
          </label>
          <Input
            type='number'
            value={priceMnt}
            onChange={(e) => setPriceMnt(e.target.value)}
            className='w-full'
          />
        </div>

        {/* Image */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Зураг (IPFS)
          </label>
          {imageUrl && (
            <div className='mb-2 rounded overflow-hidden'>
              <img
                src={imageUrl}
                alt='Preview'
                className='h-40 w-full object-cover rounded shadow'
              />
            </div>
          )}
          <Input
            type='file'
            accept='image/*'
            onChange={handleImageUpload}
            disabled={uploadingImage}
          />
          {uploadingImage && (
            <p className='text-blue-600 text-sm mt-1'>
              Зураг IPFS-д байршуулж байна...
            </p>
          )}
        </div>

        {/* Save button */}
        <Button
          onClick={handleUpdateItem}
          disabled={loading}
          className='bg-blue-600 text-white w-full'
        >
          {loading ? 'Шинэчилж байна...' : 'Шинэчлэх'}
        </Button>
      </div>
    </div>
  );
}
