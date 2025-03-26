'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BrowserProvider } from 'ethers';

import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, Trash2, PlusCircle } from 'lucide-react';

import { getFundraisingContract } from '@/services/fundraisingConfig';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { ReportItem } from '@/app/interfaces';

interface PaymentData {
  // ...
  reports?: ReportItem[];
}

interface FormData {
  // ...
  paymentInfo?: PaymentData;
}

export default function CampaignReportPage() {
  const { id } = useParams();
  const router = useRouter();

  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Шинээр нэмэх тайлан + зураг файл
  const [newReport, setNewReport] = useState<ReportItem>({
    title: '',
    amount: '',
    date: '',
    description: '',
  });
  const [newReportFile, setNewReportFile] = useState<File | null>(null);

  // -------------------------------------------------------
  // 1) Одоогийн тайланг contract metadata‐ээс татах
  // -------------------------------------------------------
  useEffect(() => {
    async function fetchMetadata() {
      try {
        if (!id) return;
        setLoading(true);

        // (A) Provider ба гэрээ дуудаж, metadataHash авах
        const provider = new BrowserProvider((window as any).ethereum);
        const contract = getFundraisingContract(provider);
        const campaignData = await contract.getCampaign(Number(id));
        const metadataHash = campaignData[9]; // IPFS CID

        if (!metadataHash) {
          console.log('No metadataHash found in contract');
          return;
        }

        // (B) IPFS‐ээс formData татах
        const res = await fetch(`/api/fetchFromPinata?cid=${metadataHash}`);
        if (!res.ok) throw new Error('Failed to fetch metadata from IPFS');
        const json: FormData = await res.json();

        // (C) Одоо байгаа reports массивыг state‐д оноох
        const existingReports = json.paymentInfo?.reports || [];
        setReports(existingReports);
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchMetadata();
  }, [id]);

  // -------------------------------------------------------
  // 2) Шинээр тайлангийн мөр нэмэх (зурагтай/зураггүй)
  // -------------------------------------------------------
  async function addReportItem() {
    if (!newReport.title || !newReport.amount) {
      alert('Гарчиг, дүн талбаруудыг бөглөнө үү!');
      return;
    }

    let imageUrl = '';
    if (newReportFile) {
      // (A) Pinata руу зураг upload
      const ipfsUrl = await uploadImageToPinata(newReportFile);
      // ipfsUrl нь "ipfs://..." хэлбэртэй гэж үзье
      imageUrl = ipfsUrl;
    }

    // (B) Шинэ тайлангийн мөр
    const finalReport: ReportItem = {
      ...newReport,
      imageUrl,
    };

    setReports((prev) => [...prev, finalReport]);
    setNewReport({ title: '', amount: '', date: '', description: '' });
    setNewReportFile(null);
  }

  // -------------------------------------------------------
  // 2.1) Pinata руу зураг upload хийх туслах функц
  // -------------------------------------------------------
  async function uploadImageToPinata(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/pinataUploadImage', {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      throw new Error('Failed to upload image to Pinata');
    }

    // { ipfsUrl: 'ipfs://Qm123...' }
    const { ipfsUrl } = await res.json();
    return ipfsUrl; // "ipfs://..."
  }

  // Тайлангийн мөр устгах
  function removeReportItem(index: number) {
    setReports((prev) => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
  }

  // -------------------------------------------------------
  // 3) Тайлан хадгалах + кампани хаах (хэрэв идэвхтэй бол)
  // -------------------------------------------------------
  async function handleSaveReports() {
    try {
      setLoading(true);
      setError(null);

      if (!id) return;

      // (A) Contract ба campaignData
      const provider = new BrowserProvider((window as any).ethereum);
      const contract = getFundraisingContract(provider);
      const campaignData = await contract.getCampaign(Number(id));
      const metadataHash = campaignData[9];
      if (!metadataHash) {
        throw new Error('No metadataHash in contract');
      }

      // (B) Одоогийн formData-г IPFS-ээс татах
      const oldRes = await fetch(`/api/fetchFromPinata?cid=${metadataHash}`);
      if (!oldRes.ok) {
        throw new Error('Failed to fetch old metadata from IPFS');
      }
      const oldFormData: FormData = await oldRes.json();

      // (C) Шинэчилсэн formData
      const updatedFormData: FormData = {
        ...oldFormData,
        paymentInfo: {
          ...oldFormData.paymentInfo,
          reports, // бидний шинэ тайлан массив
        },
      };

      // (D) IPFS рүү upload
      const uploadRes = await fetch('/api/pinataUpload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: JSON.stringify(updatedFormData) }),
      });
      if (!uploadRes.ok) {
        throw new Error('Failed to upload updated metadata to IPFS');
      }
      const { cid: newCid } = await uploadRes.json();

      // (E) Contract дээр metadataHash шинэчлэх
      const signer = await provider.getSigner();
      const contractWithSigner = getFundraisingContract(signer);
      const tx = await contractWithSigner.updateMetadataHash(
        Number(id),
        newCid
      );
      await tx.wait();

      // (F) Хэрэв кампани идэвхтэй бол хаах
      const campaignData2 = await contractWithSigner.getCampaign(Number(id));
      const isActive = campaignData2[7]; // bool
      if (isActive) {
        const tx2 = await contractWithSigner.closeCampaign(Number(id));
        await tx2.wait();
        alert('Тайлан амжилттай хадгалж, кампани хаалаа!');
      } else {
        alert('Тайлан амжилттай хадгаллаа (кампани аль хэдийн хаагдсан).');
      }

      router.push(`/campaigns/${id}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // -------------------------------------------------------
  // Rendering
  // -------------------------------------------------------
  if (loading) {
    return (
      <div className='min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white to-blue-50'>
        <Skeleton className='h-40 w-3/4 rounded-md bg-gray-300 animate-pulse' />
        <p className='text-gray-500 mt-2'>Ачааллаж байна...</p>
      </div>
    );
  }
  if (error) {
    return <p className='text-red-500 p-4'>Алдаа гарлаа: {error}</p>;
  }

  return (
    <div className='max-w-2xl mx-auto p-4 space-y-6'>
      <motion.h1
        className='text-xl font-bold mb-4 text-blue-700 flex items-center gap-2'
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <ImageIcon className='w-5 h-5 text-blue-600' />
        Хөрөнгө ашиглалтын тайлан
      </motion.h1>

      {/* Одоогийн тайлангийн жагсаалт */}
      <motion.div
        className='border border-gray-300 rounded p-4'
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <h2 className='text-lg font-semibold mb-2 text-gray-800'>
          Одоогийн тайлан
        </h2>
        {reports.length === 0 ? (
          <p className='text-sm text-gray-500'>Одоогоор тайлан алга байна.</p>
        ) : (
          <div className='space-y-3'>
            <AnimatePresence>
              {reports.map((report, idx) => (
                <motion.div
                  key={idx}
                  className='border border-gray-200 rounded p-3 relative'
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <button
                    type='button'
                    className='absolute top-2 right-2 text-sm text-red-400 hover:text-red-600'
                    onClick={() => removeReportItem(idx)}
                  >
                    <Trash2 className='w-4 h-4' />
                  </button>
                  <h3 className='font-semibold text-gray-800 mb-1'>
                    {report.title} — {report.amount}₮
                  </h3>
                  <p className='text-xs text-gray-500'>{report.date}</p>
                  <p className='text-sm mt-1 text-gray-700'>
                    {report.description}
                  </p>

                  {/* Хэрэв imageUrl байвал IPFS зураг харуулах */}
                  {report.imageUrl && (
                    <motion.img
                      src={report.imageUrl.replace(
                        'ipfs://',
                        'https://gateway.pinata.cloud/ipfs/'
                      )}
                      alt='Report'
                      className='mt-2 w-full max-h-48 object-cover rounded border border-gray-200 cursor-pointer hover:opacity-90'
                      whileHover={{ scale: 1.02 }}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          '/images/no-image.png';
                      }}
                    />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      {/* Шинээр тайлан нэмэх хэсэг */}
      <motion.div
        className='border border-gray-300 rounded p-4 space-y-3'
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <div className='flex items-center gap-2 mb-2'>
          <PlusCircle className='w-5 h-5 text-blue-600' />
          <h2 className='text-lg font-semibold text-gray-800'>
            Шинэ тайлан нэмэх
          </h2>
        </div>

        <Input
          placeholder='Гарчиг (Жишээ: “Оффис түрээс төлсөн”)'
          value={newReport.title}
          onChange={(e) =>
            setNewReport({ ...newReport, title: e.target.value })
          }
        />
        <Input
          placeholder='Дүн (₮)'
          value={newReport.amount}
          onChange={(e) =>
            setNewReport({ ...newReport, amount: e.target.value })
          }
        />
        <Input
          type='date'
          placeholder='Огноо'
          value={newReport.date}
          onChange={(e) => setNewReport({ ...newReport, date: e.target.value })}
        />
        <Textarea
          placeholder='Дэлгэрэнгүй тайлбар...'
          value={newReport.description}
          onChange={(e) =>
            setNewReport({ ...newReport, description: e.target.value })
          }
          className='h-24'
        />

        {/* Зураг сонгох талбар */}
        <div>
          <label className='block text-sm text-gray-600 mb-1 flex items-center gap-1'>
            <ImageIcon className='w-4 h-4 text-gray-500' />
            Тайлангийн зураг (сонгох):
          </label>
          <Input
            type='file'
            accept='image/*'
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                setNewReportFile(e.target.files[0]);
              }
            }}
          />
          {/* Урьдчилсан харагдац */}
          {newReportFile && (
            <motion.img
              src={URL.createObjectURL(newReportFile)}
              alt='Preview'
              className='mt-2 w-full max-h-48 object-cover rounded border border-gray-200'
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </div>

        <Button variant='outline' onClick={addReportItem}>
          Тайлангийн мөр нэмэх
        </Button>
      </motion.div>

      {/* Тайлан хадгалах товч */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Button
          onClick={handleSaveReports}
          className='bg-blue-600 text-white w-full'
        >
          {loading ? 'Хадгалж байна...' : 'Тайлан хадгалах'}
        </Button>
      </motion.div>
    </div>
  );
}
