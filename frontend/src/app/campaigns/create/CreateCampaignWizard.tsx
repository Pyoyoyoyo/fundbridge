'use client';

import { useState } from 'react';
import { BrowserProvider, ethers } from 'ethers';
import { useRouter } from 'next/navigation';
import { getFundraisingContract } from '@/services/contractConfig';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

/** Шаардлагатай алхмын компонентууд */
import BasicsStep from './steps/BasicsStep';
import RewardsStep from './steps/RewardsStep';
import StoryStep from './steps/StoryStep';
import PeopleStep from './steps/PeopleStep';
import PaymentStep from './steps/PaymentStep';
import PromotionStep from './steps/PromotionStep';

/** Шинээр үүсгэсэн interfaces.ts-ээс FormData, BasicsData, StoryData гэх мэтийг импортлох */
import { FormData } from '@/app/campaigns/create/interfaces/types'; // <-- Замыг тохируулна

const TOTAL_STEPS = 6;

export default function CreateCampaignWizard() {
  const router = useRouter();

  // Анхны хоосон FormData
  const [formData, setFormData] = useState<FormData>({
    basics: {
      title: '',
      description: '',
      primaryCategory: '',
      imageUrl: '',
      videoUrl: '',
      goal: '',
      targetLaunchDate: '',
      latePledges: false,
    },
    rewards: {
      items: [],
      description: '',
    },
    story: {
      introduceProject: '',
      storyDetail: '',
      risks: '',
      faq: '',
    },
    people: {
      vanityURL: '',
      demographics: '',
      collaborators: '',
    },
    paymentInfo: {
      bankInfo: '',
      cryptoWallet: '',
    },
    promotion: {
      marketingPlan: '',
      socialMedia: '',
    },
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** formData-г шинэчлэх туслах функц */
  function updateFormData(fields: Partial<FormData>) {
    setFormData((prev) => ({ ...prev, ...fields }));
  }

  /** Алхам бүрийн validation хийх (шаардлагатай бол) */
  function validateStep(step: number): boolean {
    // Хэрэв шаардлагатай бол алхам тутмын шалгалт энд
    return true;
  }

  /** Дараагийн алхам руу шилжих */
  async function handleNext() {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
    }
  }

  /** Өмнөх алхам руу шилжих */
  function prevStep() {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  }

  /**
   * Бүх өгөгдлийг нэгтгэж, IPFS эсвэл таны API дээр хадгалсны дараа
   * гэрээний createCampaign(...) функц рүү гол талбарууд + metadataHash илгээдэг жишээ.
   */
  async function handleFinish() {
    try {
      setLoading(true);
      setError(null);

      // 1) Тухайн бүх мэдээллээ JSON болгоно (off-chain metadata)
      const metadata = {
        basics: formData.basics,
        rewards: formData.rewards,
        story: formData.story,
        people: formData.people,
        paymentInfo: formData.paymentInfo,
        promotion: formData.promotion,
      };
      const metadataStr = JSON.stringify(metadata);

      // 2) Тухайн metadata-г IPFS эсвэл таны API дээр upload хийх (жишээ нь /api/ipfsUpload)
      // Хэрэв IPFS-г шууд client дээрээс дуудахгүй бол API route ашиглаж болно
      const res = await fetch('/api/ipfsUpload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: metadataStr }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to upload to IPFS');
      }
      const { cid } = await res.json();
      console.log('metadataHash (CID) =', cid);

      // 3) MetaMask ашиглан гэрээний createCampaign(...) рүү гол талбаруудыг илгээх
      if (!window.ethereum) {
        alert('MetaMask not found!');
        return;
      }
      const provider = new BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();

      // Үйлчилгээний код: гэрээг авч, createCampaign дуудах
      const contract = getFundraisingContract(signer);

      // goal-ыг тоон утга болгож, NaN эсэхийг шалгана
      const goalNumber = parseInt(formData.basics.goal, 10);
      if (isNaN(goalNumber)) {
        setError(
          'Санхүүжилтийн дүн (goal) талбарт зөвхөн тоон утга оруулна уу.'
        );
        return;
      }

      // createCampaign(title, description, goal, imageUrl, metadataHash)
      const tx = await contract.createCampaign(
        formData.basics.title,
        formData.basics.description,
        goalNumber,
        formData.basics.imageUrl,
        cid
      );
      await tx.wait();

      alert('Кампанит ажил амжилттай үүслээ!');
      router.push('/campaigns');
    } catch (err: any) {
      console.error(err);
      setError(`Алдаа: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  /** Аль алхам дээр байгаагаас шалтгаалан харуулах компонент */
  function renderStep() {
    switch (currentStep) {
      case 1:
        return (
          <BasicsStep formData={formData} updateFormData={updateFormData} />
        );
      case 2:
        return (
          <RewardsStep formData={formData} updateFormData={updateFormData} />
        );
      case 3:
        return (
          <StoryStep formData={formData} updateFormData={updateFormData} />
        );
      case 4:
        return (
          <PeopleStep formData={formData} updateFormData={updateFormData} />
        );
      case 5:
        return (
          <PaymentStep formData={formData} updateFormData={updateFormData} />
        );
      case 6:
        return (
          <PromotionStep formData={formData} updateFormData={updateFormData} />
        );
      default:
        return null;
    }
  }

  return (
    <div className='max-w-3xl mx-auto bg-white p-4 rounded shadow space-y-4'>
      <h1 className='text-2xl font-bold text-gray-800'>
        Кампанит ажил үүсгэх (Wizard)
      </h1>

      {error && (
        <Alert variant='destructive'>
          <AlertTitle>Алдаа</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {renderStep()}

      <div className='flex justify-between mt-4'>
        {currentStep > 1 ? (
          <Button variant='outline' onClick={prevStep}>
            Өмнөх
          </Button>
        ) : (
          <div />
        )}

        {currentStep < TOTAL_STEPS ? (
          <Button
            onClick={handleNext}
            disabled={loading}
            className='bg-blue-600'
          >
            Дараагийн шат
          </Button>
        ) : (
          <Button
            onClick={handleFinish}
            disabled={loading}
            className='bg-blue-600'
          >
            {loading ? 'Үүсгэж байна...' : 'Дуусгах'}
          </Button>
        )}
      </div>

      <p className='text-sm text-gray-500'>
        Алхам {currentStep} / {TOTAL_STEPS}
      </p>
    </div>
  );
}
