'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ethers } from 'ethers';
import { getFundraisingContract } from '@/services/fundraisingConfig';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import DonateButton from '@/components/ui/DonateButton';

// 1 ETH ~ 6,000,000 MNT
const ETH_TO_MNT_RATE = 6000000;

interface Metadata {
  // ... таны metadata struct
}

export default function CampaignDetailPage() {
  const { id } = useParams();
  const [campaign, setCampaign] = useState<any>(null);
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function detectUser() {
    if ((window as any)?.ethereum) {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      return accounts[0];
    }
    return null;
  }

  useEffect(() => {
    async function fetchCampaign() {
      try {
        setLoading(true);
        if (!id) return;

        const userAddress = await detectUser();
        setCurrentUser(userAddress);

        // 1) Provider
        let provider: ethers.BrowserProvider | ethers.JsonRpcProvider;
        if ((window as any)?.ethereum) {
          provider = new ethers.BrowserProvider((window as any).ethereum);
        } else {
          provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
        }

        const contract = getFundraisingContract(provider as any);
        const data = await contract.getCampaign(Number(id));
        // data: [id, owner, title, description, goalWei, raisedWei, isActive, imageUrl, metadataHash]

        const rawGoalWei = data[4];
        const rawRaisedWei = data[5];
        const goalEth = parseFloat(ethers.formatEther(rawGoalWei));
        const raisedEth = parseFloat(ethers.formatEther(rawRaisedWei));

        const goalMnt = Math.floor(goalEth * ETH_TO_MNT_RATE);
        const raisedMnt = Math.floor(raisedEth * ETH_TO_MNT_RATE);

        const parsed = {
          id: Number(data[0]),
          owner: data[1],
          title: data[2],
          description: data[3],
          goalWei: rawGoalWei,
          raisedWei: rawRaisedWei,
          goalMnt,
          raisedMnt,
          isActive: data[6],
          imageUrl: data[7] || '',
          metadataHash: data[8] || '',
        };
        setCampaign(parsed);

        // Owner эсэхийг шалгах
        if (
          userAddress &&
          userAddress.toLowerCase() === parsed.owner.toLowerCase()
        ) {
          setIsOwner(true);
        }

        // IPFS metadata fetch
        if (parsed.metadataHash) {
          try {
            const ipfsUrl = `https://ipfs.io/ipfs/${parsed.metadataHash}`;
            const ipfsRes = await fetch(ipfsUrl);
            if (ipfsRes.ok) {
              const metaJson = await ipfsRes.json();
              setMetadata(metaJson);
            }
          } catch (ipfsErr) {
            console.warn('IPFS fetch error:', ipfsErr);
          }
        }
      } catch (err) {
        console.error(err);
        setError('Алдаа гарлаа: ' + (err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    fetchCampaign();
  }, [id]);

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <Skeleton className='h-40 w-3/4 bg-gray-300' />
        <p className='text-gray-500 mt-2'>Ачааллаж байна...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant='destructive' className='m-4 bg-red-600 text-white'>
        <AlertTitle>Алдаа</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!campaign) {
    return (
      <Alert variant='destructive' className='m-4 bg-red-600 text-white'>
        <AlertTitle>Алдаа</AlertTitle>
        <AlertDescription>Кампанит ажил олдсонгүй</AlertDescription>
      </Alert>
    );
  }

  const progressPercent =
    campaign.goalMnt > 0
      ? Math.min((campaign.raisedMnt / campaign.goalMnt) * 100, 100).toFixed(0)
      : '0';

  return (
    <div className='min-h-screen bg-gray-50 p-8 flex flex-col items-center'>
      <div className='max-w-3xl w-full space-y-6'>
        <Card className='bg-white shadow-lg rounded-lg'>
          <CardHeader className='bg-blue-100 p-4 rounded-t-lg text-blue-800'>
            <CardTitle className='text-2xl font-bold'>
              {campaign.title}
            </CardTitle>
          </CardHeader>
          <CardContent className='p-4 space-y-4'>
            <p className='text-gray-700'>{campaign.description}</p>
            {campaign.imageUrl && (
              <img
                src={campaign.imageUrl}
                alt='Campaign'
                className='rounded w-full h-auto object-cover'
              />
            )}

            <Progress
              value={parseFloat(progressPercent)}
              className='my-3 bg-gray-200'
            />
            <div className='flex justify-between text-sm text-gray-800'>
              <span>
                Зорилго:{' '}
                <strong>{campaign.goalMnt.toLocaleString()} MNT</strong>
              </span>
              <span>
                Цугласан:{' '}
                <strong className='text-blue-600'>
                  {campaign.raisedMnt.toLocaleString()} MNT
                </strong>
              </span>
            </div>

            {/* Donate Button */}
            {campaign.isActive ? (
              <DonateButton
                campaignId={campaign.id}
                className='bg-blue-600 text-white hover:bg-blue-500 w-full'
              />
            ) : (
              <p className='text-red-600 font-semibold'>
                Энэ кампанит ажил хаагдсан.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Эзэмшигчийн үйлдлүүд */}
        {isOwner && <OwnerActions campaign={campaign} />}
      </div>

      {/* Story, Rewards, People, etc. (metadata) */}
      {/* Та өмнөх кодын жишээгээр оруулна уу */}
    </div>
  );
}

// Эзэмшигчийн үйлдлүүдийг тусдаа компонент
function OwnerActions({ campaign }: { campaign: any }) {
  const [updating, setUpdating] = useState(false);
  const [closing, setClosing] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  const [newTitle, setNewTitle] = useState(campaign.title);
  const [newDesc, setNewDesc] = useState(campaign.description);
  const [newImageUrl, setNewImageUrl] = useState(campaign.imageUrl);
  const [newMetadataHash, setNewMetadataHash] = useState(campaign.metadataHash);

  const [withdrawAmount, setWithdrawAmount] = useState('');

  async function handleUpdate() {
    // updateCampaign(...)
    try {
      setUpdating(true);
      if (!(window as any)?.ethereum) return;
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const contract = getFundraisingContract(signer);

      // Жишээ: contract.updateCampaign(id, newTitle, newDesc, newImageUrl, newMetadataHash)
      const tx = await contract.updateCampaign(
        campaign.id,
        newTitle,
        newDesc,
        newImageUrl,
        newMetadataHash
      );
      await tx.wait();
      alert('Амжилттай шинэчиллээ!');
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('Update алдаа: ' + (err as Error).message);
    } finally {
      setUpdating(false);
    }
  }

  async function handleClose() {
    // closeCampaign(...)
    try {
      setClosing(true);
      if (!(window as any)?.ethereum) return;
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const contract = getFundraisingContract(signer);

      const tx = await contract.closeCampaign(campaign.id);
      await tx.wait();
      alert('Кампанит ажил хаагдлаа!');
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('Close алдаа: ' + (err as Error).message);
    } finally {
      setClosing(false);
    }
  }

  async function handleWithdraw() {
    // withdraw(...)
    try {
      setWithdrawing(true);
      if (!(window as any)?.ethereum) return;
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const contract = getFundraisingContract(signer);

      const mnt = parseInt(withdrawAmount, 10);
      if (isNaN(mnt) || mnt <= 0) {
        alert('Зөв дүн оруулна уу!');
        return;
      }
      // MNT -> ETH -> wei
      const approximateEth = mnt / 6000000;
      const withdrawWei = ethers.parseEther(approximateEth.toFixed(18));

      const tx = await contract.withdraw(campaign.id, withdrawWei);
      await tx.wait();
      alert('Амжилттай татлаа!');
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('Withdraw алдаа: ' + (err as Error).message);
    } finally {
      setWithdrawing(false);
    }
  }

  return (
    <Card className='bg-white shadow rounded-lg'>
      <CardHeader className='bg-gray-100 p-4 rounded-t-lg'>
        <CardTitle className='text-lg font-semibold text-gray-800'>
          Эзэмшигчийн үйлдлүүд
        </CardTitle>
      </CardHeader>
      <CardContent className='p-4 space-y-4'>
        {/* Update Form */}
        <div className='border border-gray-200 p-3 rounded'>
          <h3 className='font-medium text-gray-700 mb-2'>
            Кампанит ажил шинэчлэх
          </h3>
          <label className='text-sm text-gray-600'>Гарчиг</label>
          <input
            type='text'
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className='w-full mb-2 border p-2 rounded'
          />
          <label className='text-sm text-gray-600'>Тайлбар</label>
          <textarea
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            className='w-full mb-2 border p-2 rounded'
          />
          <label className='text-sm text-gray-600'>Зургийн URL</label>
          <input
            type='text'
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            className='w-full mb-2 border p-2 rounded'
          />
          <label className='text-sm text-gray-600'>
            Metadata Hash (IPFS CID)
          </label>
          <input
            type='text'
            value={newMetadataHash}
            onChange={(e) => setNewMetadataHash(e.target.value)}
            className='w-full mb-2 border p-2 rounded'
          />

          <Button
            onClick={handleUpdate}
            disabled={updating}
            className='bg-blue-600 text-white hover:bg-blue-500'
          >
            {updating ? 'Шинэчилж байна...' : 'Шинэчлэх'}
          </Button>
        </div>

        {/* Close Campaign */}
        <div className='border border-gray-200 p-3 rounded'>
          <h3 className='font-medium text-gray-700 mb-2'>
            Кампанит ажлаа хаах
          </h3>
          <Button
            onClick={handleClose}
            disabled={closing}
            variant='destructive'
            className='bg-red-600 text-white hover:bg-red-500'
          >
            {closing ? 'Хааж байна...' : 'Хаах'}
          </Button>
        </div>

        {/* Withdraw funds */}
        <div className='border border-gray-200 p-3 rounded'>
          <h3 className='font-medium text-gray-700 mb-2'>
            Хандивласан мөнгө татах
          </h3>
          <label className='text-sm text-gray-600'>Татах дүн (MNT)</label>
          <input
            type='number'
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            className='w-full mb-2 border p-2 rounded'
            placeholder='100000 (MNT)'
          />
          <Button
            onClick={handleWithdraw}
            disabled={withdrawing}
            className='bg-blue-600 text-white hover:bg-blue-500'
          >
            {withdrawing ? 'Татаж байна...' : 'Татах'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
