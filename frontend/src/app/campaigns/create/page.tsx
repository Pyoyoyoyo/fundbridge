'use client';

import { useState } from 'react';
import { BrowserProvider, ethers } from 'ethers';
import { getFundraisingContract } from '@/services/contractConfig';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function CreateCampaignPage() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [goal, setGoal] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function validateForm() {
    if (!title || !desc || !goal) {
      setError('Бүх талбарыг бөглөнө үү!');
      return false;
    }
    if (parseInt(goal) <= 0) {
      setError('Зорилтот дүн 0-с их байх ёстой!');
      return false;
    }
    setError(null);
    return true;
  }

  async function handleCreate() {
    if (!validateForm()) return;

    try {
      setLoading(true);
      if (!window.ethereum) {
        alert('MetaMask олдсонгүй. Та MetaMask суулгасан эсэхээ шалгана уу.');
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const contract = getFundraisingContract(signer);

      // 🛠️ Log: Илгээх өгөгдлийг шалгая
      console.log('📤 Илгээх өгөгдөл:', { title, desc, goal, imageUrl });

      const tx = await contract.createCampaign(
        title,
        desc,
        parseInt(goal),
        imageUrl
      );
      await tx.wait();

      alert('Кампанит ажил амжилттай үүслээ!');
      router.push('/campaigns');
    } catch (error) {
      console.error(error);
      alert('Алдаа гарлаа: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <Card className='bg-gray-100 shadow-lg hover:shadow-xl transition-shadow'>
        <CardHeader className='bg-blue-600 text-white p-4 rounded-t-lg'>
          <CardTitle>Кампанит ажил үүсгэх</CardTitle>
        </CardHeader>
        <CardContent className='p-4 space-y-4'>
          {error && (
            <Alert variant='destructive' className='bg-gray-900 text-white'>
              <AlertTitle>Алдаа</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Input
            placeholder='Гарчиг'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            placeholder='Кампанит ажлын зорилго, үйл ажиллагаа...'
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
          <Input
            type='number'
            placeholder='Зорилтот дүн (MNT)'
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
          />
          <Input
            placeholder='Зургийн холбоос (image URL)'
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
          <Button
            onClick={handleCreate}
            disabled={loading}
            className='bg-blue-600 hover:bg-blue-500 text-white w-full'
          >
            {loading ? 'Үүсгэж байна...' : 'Үүсгэх'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
