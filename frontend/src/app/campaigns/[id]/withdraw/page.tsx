'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ethers, BrowserProvider } from 'ethers';

import { getFundraisingContract } from '@/services/fundraisingConfig';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

// Жишээ ханш: 1 ETH = 6,000,000 MNT гэж үзье
const ETH_TO_MNT_RATE = 6_000_000;

/**
 * Кампанийн эзэмшигч хөрөнгөө татах (бүхэлд нь) ба кампаниа хаах.
 * Дэлгэрэнгүй UI, баталгаажуулалт, тайлбар, алдаа мессежүүдтэй.
 */
export default function CampaignWithdrawPage() {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Кампанийн мэдээлэл
  const [campaign, setCampaign] = useState<any>(null);

  // Хөрөнгө татах үйлдлийн төлөв
  const [withdrawing, setWithdrawing] = useState(false);
  const [confirmChecked, setConfirmChecked] = useState(false); // баталгаажуулалт checkbox

  // currentUser (Metamask)
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  // ---------------------------
  // 1) currentUser
  // ---------------------------
  useEffect(() => {
    async function detectUser() {
      if ((window as any)?.ethereum) {
        const provider = new BrowserProvider((window as any).ethereum);
        const accounts = await provider.send('eth_requestAccounts', []);
        setCurrentUser(accounts[0]);
      }
    }
    detectUser();
  }, []);

  // ---------------------------
  // 2) Кампанийн мэдээлэл татах
  // ---------------------------
  useEffect(() => {
    async function fetchCampaign() {
      try {
        setLoading(true);
        setError(null);

        let provider: ethers.BrowserProvider | ethers.JsonRpcProvider;
        if ((window as any)?.ethereum) {
          provider = new ethers.BrowserProvider((window as any).ethereum);
        } else {
          provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
        }

        const contract = getFundraisingContract(provider as any);
        const data = await contract.getCampaign(Number(id));

        // data = [id, owner, title, category, description, goalWei, raisedWei, isActive, imageUrl, metadataHash, deadline]
        const rawGoalWei = data[5];
        const rawRaisedWei = data[6];

        // parse to BigInt
        const goalWei = BigInt(rawGoalWei.toString());
        const raisedWei = BigInt(rawRaisedWei.toString());

        // MNT хөрвүүлэх
        const goalEth = Number(ethers.formatEther(goalWei));
        const raisedEth = Number(ethers.formatEther(raisedWei));
        const goalMnt = Math.floor(goalEth * ETH_TO_MNT_RATE);
        const raisedMnt = Math.floor(raisedEth * ETH_TO_MNT_RATE);

        const parsed = {
          id: Number(data[0]),
          owner: data[1],
          title: data[2],
          category: data[3],
          description: data[4],
          goalWei,
          raisedWei,
          goalMnt,
          raisedMnt,
          isActive: data[7],
          imageUrl: data[8] || '',
          metadataHash: data[9] || '',
          deadline: Number(data[10]),
        };

        setCampaign(parsed);
      } catch (err: any) {
        console.error('Failed to fetch campaign:', err);
        setError('Алдаа гарлаа: ' + err.message);
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchCampaign();
  }, [id]);

  // ---------------------------
  // 3) Бүх хөрөнгийг татах (withdrawAll)
  // ---------------------------
  async function handleWithdrawAllAndClose() {
    if (!campaign) return;

    try {
      setWithdrawing(true);
      setError(null);

      if (!(window as any)?.ethereum) {
        alert('MetaMask not found!');
        return;
      }

      // MetaMask provider
      const provider = new BrowserProvider((window as any).ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();

      const contract = getFundraisingContract(signer);

      console.log('Withdrawing & closing campaign:', campaign.id);

      // Энд таны contract‐ын "withdrawAll" эсвэл "withdrawAllAndClose" нэртэй функц
      // Жишээ: withdrawAll(campaign.id)
      const tx = await contract.withdrawAll(campaign.id);
      await tx.wait();

      alert(
        'Хөрөнгө амжилттай татагдлаа! Та хөрөнгөө хэрхэн зарцуулснаа тайлагнахаар report хуудас руу шилжлээ.'
      );
      router.push(`/campaigns/${campaign.id}/report`);
    } catch (err: any) {
      console.error('Withdraw error:', err);
      alert('Алдаа гарлаа: ' + err.message);
    } finally {
      setWithdrawing(false);
    }
  }

  // ---------------------------
  // Rendering
  // ---------------------------
  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <Skeleton className='h-40 w-3/4 rounded-md bg-gray-300 animate-pulse' />
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

  if (!campaign) {
    return (
      <Alert variant='destructive' className='m-4'>
        <AlertTitle>Алдаа</AlertTitle>
        <AlertDescription>Кампанит ажил олдсонгүй.</AlertDescription>
      </Alert>
    );
  }

  // Эзэмшигч мөн эсэх
  const isOwner =
    currentUser &&
    currentUser.toLowerCase() === (campaign.owner || '').toLowerCase();

  // Зорилгодоо хүрсэн эсэх
  const goalReached = campaign.raisedWei >= campaign.goalWei;

  if (!isOwner) {
    return (
      <Alert variant='destructive' className='m-4'>
        <AlertTitle>Алдаа</AlertTitle>
        <AlertDescription>
          Та энэ кампанит ажлын эзэмшигч биш тул хөрөнгө татах эрхгүй.
        </AlertDescription>
      </Alert>
    );
  }

  if (!goalReached) {
    return (
      <Alert variant='destructive' className='m-4'>
        <AlertTitle>Алдаа</AlertTitle>
        <AlertDescription>
          Энэ кампани зорилгодоо хараахан хүрээгүй байна.
        </AlertDescription>
      </Alert>
    );
  }

  // UI: Кампанийн үндсэн мэдээлэл, баталгаажуулалт, товч
  const progressPercent =
    campaign.goalMnt > 0
      ? Math.min((campaign.raisedMnt / campaign.goalMnt) * 100, 100).toFixed(0)
      : '0';

  return (
    <div className='min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-blue-50 p-6'>
      <Card className='max-w-lg w-full bg-white shadow-md p-6'>
        <CardHeader>
          <CardTitle className='text-xl font-bold'>
            Хөрөнгө татах &amp; Кампани хаах
          </CardTitle>
        </CardHeader>
        <CardContent className='mt-4 space-y-4'>
          {/* Кампанийн товч мэдээлэл */}
          <div className='border border-gray-200 rounded p-3'>
            <h3 className='font-semibold text-gray-800 text-lg mb-1'>
              {campaign.title}
            </h3>
            <p className='text-sm text-gray-600 mb-2'>{campaign.description}</p>

            <div className='flex gap-2 items-center'>
              <span className='text-sm text-gray-800'>
                Зорилго:{' '}
                <strong className='text-blue-600'>
                  {campaign.goalMnt.toLocaleString()}₮
                </strong>
              </span>
              <span className='text-sm text-gray-800'>
                Цугласан:{' '}
                <strong className='text-blue-600'>
                  {campaign.raisedMnt.toLocaleString()}₮
                </strong>
              </span>
            </div>
            <Progress
              value={parseFloat(progressPercent)}
              className='my-2 bg-gray-200'
            />
            <p className='text-xs text-gray-500'>({progressPercent}% хүрсэн)</p>
          </div>

          <div className='text-gray-700 text-sm'>
            Та бүх хөрөнгийг (raised) татаж авах болно. Энэ үйлдлийг хийснээр
            төслийг хаах ба дэмжигчдэдээ хөрөнгөө хэрхэн зарцуулсан талаараа
            тайлагнах үүрэгтэй. Хэрэв таны тайлан хангалтгүй гэж үзвэл
            гомдол/маргаан гарах эрсдэлтэйг анхаарна уу.
          </div>

          {/* Баталгаажуулалт checkbox */}
          <label className='flex items-center text-sm text-gray-600 gap-2'>
            <input
              type='checkbox'
              className='form-checkbox'
              checked={confirmChecked}
              onChange={() => setConfirmChecked(!confirmChecked)}
            />
            <span>
              Би бүх хөрөнгийг татан авснаар төслийг хааж, зарцуулалтын тайланг
              үнэн зөв гаргах үүрэгтэй гэдгээ зөвшөөрч байна.
            </span>
          </label>

          {withdrawing ? (
            <p className='text-blue-600 font-medium'>Ачааллаж байна...</p>
          ) : (
            <Button
              onClick={handleWithdrawAllAndClose}
              className='bg-blue-600 text-white w-full'
              disabled={!confirmChecked}
            >
              Бүх хөрөнгийг татаж, кампаниа хаах
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
