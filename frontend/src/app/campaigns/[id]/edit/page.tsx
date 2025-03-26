'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { BrowserProvider, ethers } from 'ethers';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import EditCampaignWizard from '@/components/campaigns/[id]/edit/EditCampaignWizard';
import { getFundraisingContract } from '@/services/fundraisingConfig';
import type { FormData } from '@/app/interfaces';

export default function EditCampaignPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id } = useParams(); // /campaigns/123/edit → id="123"

  // id нь string тул parseInt хийнэ
  const campaignId = parseInt(Array.isArray(id) ? id[0] : id ?? '0', 10);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Wizard‐т дамжуулах formData
  const [formData, setFormData] = useState<FormData | null>(null);

  // Хэрэглэгч нэвтрээгүй бол /login руу чиглүүлэх
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // -------------------------------------------------------
  // 1) Campaign мэдээлэл татах + IPFS metadata татах
  // -------------------------------------------------------
  useEffect(() => {
    async function fetchCampaignData() {
      try {
        setLoading(true);
        setError(null);

        // campaignId 0, NaN, эсвэл 0‐ээс доош бол алдаа гаргана
        if (!campaignId || isNaN(campaignId) || campaignId <= 0) {
          throw new Error('campaignId буруу байна.');
        }

        // MetaMask provider
        if (!window.ethereum) {
          throw new Error('MetaMask not found');
        }
        const provider = new BrowserProvider(window.ethereum);
        await provider.send('eth_requestAccounts', []);
        const signer = await provider.getSigner();

        const contract = getFundraisingContract(signer);
        const data = await contract.getCampaign(campaignId);
        // data = [id, owner, title, primaryCategory, description, goalWei, raisedWei, isActive, imageUrl, metadataHash, deadline, wasGoalReached]

        // Contract‐ын үндсэн талбаруудыг parse
        const rawGoalWei = data[5];
        const goalEth = parseFloat(ethers.formatEther(rawGoalWei));
        const goalMnt = Math.floor(goalEth * 6_000_000);

        const campaignTitle = data[2];
        const campaignDesc = data[4];
        const primaryCategory = data[3];
        const imageUrl = data[8] || '';
        const metadataHash = data[9] || '';
        const deadlineSec = Number(data[10]) || 0;

        // formData‐ийн basics хэсэгт урьдчилж бөглөх
        let prefill: FormData = {
          basics: {
            title: campaignTitle,
            primaryCategory,
            description: campaignDesc,
            imageUrl,
            videoUrl: '', // contract дээр видео link байхгүй тул хоосон
            goal: goalMnt.toString(), // MNT‐ээр
            targetLaunchDate: '', // contract дээр байхгүй
            latePledges: false,
            targetEndDate: deadlineSec
              ? new Date(deadlineSec * 1000).toISOString().split('T')[0]
              : '',
          },
          rewards: {
            items: [],
            description: '',
          },
          story: {
            introduceProject: '',
            storyDetail: '',
            risks: '',
            faq: [],
          },
          people: {
            vanityURL: '',
            demographics: '',
            collaborators: [],
          },
          paymentInfo: {
            fundingCosts: [],
            fundbridgeFee: '',
            publishingFee: '',
          },
          promotion: {
            marketingPlan: '',
            socialMedia: '',
          },
        };

        // 2) Хэрэв metadataHash байвал IPFS‐ээс formData татаж merge хийнэ
        if (metadataHash) {
          const metaRes = await fetch(
            `/api/fetchFromPinata?cid=${metadataHash}`
          );
          if (metaRes.ok) {
            const ipfsJson = await metaRes.json();
            // IPFS‐т хадгалсан бүтэцтэйгээ тааруулж merge хийнэ
            prefill = {
              ...prefill,
              ...ipfsJson,
              basics: {
                ...prefill.basics,
                ...ipfsJson.basics,
              },
            };
          }
        }

        setFormData(prefill);
      } catch (err: any) {
        console.error('fetchCampaignData error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (status === 'authenticated') {
      fetchCampaignData();
    }
  }, [campaignId, status]);

  // Ачааллаж байгаа үед
  if (loading) {
    return (
      <div className='min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white to-blue-50'>
        <Skeleton className='h-40 w-3/4 rounded-md bg-gray-300 animate-pulse' />
        <p className='text-gray-500 mt-2'>Ачааллаж байна...</p>
      </div>
    );
  }

  // Алдаа гарвал
  if (error) {
    return (
      <Alert variant='destructive' className='m-4'>
        <AlertTitle>Алдаа</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // formData null бол
  if (!formData) {
    return null; // эсвэл loading state
  }

  // formData бэлэн бол EditCampaignWizard руу дамжуулна
  return (
    <EditCampaignWizard campaignId={campaignId} initialFormData={formData} />
  );
}
