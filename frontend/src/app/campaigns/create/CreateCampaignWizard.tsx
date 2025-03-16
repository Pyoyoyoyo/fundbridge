'use client';

import { useState } from 'react';
import { BrowserProvider, ethers } from 'ethers';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2, Terminal } from 'lucide-react';

import BasicsStep from './steps/BasicsStep';
import RewardsStep from './steps/RewardsStep';
import StoryStep from './steps/StoryStep';
import PeopleStep from './steps/PeopleStep';
import PaymentStep from './steps/PaymentStep';
import PromotionStep from './steps/PromotionStep';

import StepIndicator from '@/components/ui/StepIndicator';
import {
  File,
  Gift,
  BookOpen,
  Users,
  CreditCard,
  Megaphone,
} from 'lucide-react';

import { FormData } from '@/app/campaigns/create/interfaces/types';
import { getFundraisingContract } from '@/services/contractConfig';

const TOTAL_STEPS = 6;

const WizardSteps = [
  { id: 1, title: 'Үндсэн мэдээлэл', icon: <File className='w-4 h-4' /> },
  { id: 2, title: 'Шагнал', icon: <Gift className='w-4 h-4' /> },
  { id: 3, title: 'Төслийн түүх', icon: <BookOpen className='w-4 h-4' /> },
  { id: 4, title: 'Хувийн мэдээлэл', icon: <Users className='w-4 h-4' /> },
  { id: 5, title: 'Төлбөр', icon: <CreditCard className='w-4 h-4' /> },
  { id: 6, title: 'Сурталчилгаа', icon: <Megaphone className='w-4 h-4' /> },
];

export default function CreateCampaignWizard() {
  const router = useRouter();

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
      targetEndDate: '',
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

  // loading, error state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // formData-г шинэчлэх туслах функц
  function updateFormData(fields: Partial<FormData>) {
    setFormData((prev) => ({ ...prev, ...fields }));
  }

  // Алхам бүрийн validation
  function validateStep(step: number): boolean {
    // Энд алхам тус бүрийн шалгалт хийж болно
    return true;
  }

  // Дараагийн алхам руу шилжих
  async function handleNext() {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
    }
  }

  // Өмнөх алхам руу шилжих
  function prevStep() {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  }

  // Дуусгах (createCampaign + IPFS upload)
  async function handleFinish() {
    try {
      setLoading(true);
      setError(null);

      // 1) formData-гаа IPFS рүү upload
      const metadataStr = JSON.stringify(formData);
      const res = await fetch('/api/pinataUpload', {
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

      // 2) Эфиртэй холбогдох
      if (!window.ethereum) {
        alert('MetaMask not found!');
        return;
      }
      const provider = new BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const contract = getFundraisingContract(signer);

      // 1) хэрэглэгчийн оруулсан MNT утгыг авч шалгана
      const goalMNT = parseInt(formData.basics.goal, 10);
      if (isNaN(goalMNT) || goalMNT <= 0) {
        throw new Error(
          'Санхүүжилтийн дүн (goal) зөвхөн тоо, мөн 0-с их байх ёстой!'
        );
      }

      // 2) MNT -> ETH
      // Жишээ ханш: 1 ETH = 6,000,000 MNT
      const ETH_TO_MNT_RATE = 6_000_000;
      const goalEth = goalMNT / ETH_TO_MNT_RATE;
      // Жишээ нь 10,000,000 MNT = ~1.6667 ETH

      // 3) ETH -> Wei
      const goalWei = ethers.parseEther(goalEth.toString());
      // parseEther("1.6667") => ~1.6667 * 10^18 wei
      const title = formData.basics.title || '';
      if (!title || title.length > 200) {
        throw new Error(
          'Гарчиг (title) хоосон байж болохгүй, урт нь 200 тэмдэгтээс хэтрэхгүй!'
        );
      }

      const targetEndDateSec = Math.floor(
        new Date(formData.basics.targetEndDate).getTime() / 1000
      );
      if (targetEndDateSec <= Math.floor(Date.now() / 1000)) {
        throw new Error(
          'Төслийн дуусах огноо (targetEndDate) одоогийн цагаас хойш байх ёстой!'
        );
      }

      // 4) createCampaign дуудлага
      const tx = await contract.createCampaign(
        title,
        formData.basics.primaryCategory,
        formData.basics.description,
        goalWei, // wei хэлбэр гэж үзвэл, 10**18-р үржүүлж болно
        formData.basics.imageUrl,
        cid, // зөвхөн IPFS CID дамжуулна
        targetEndDateSec
      );
      await tx.wait();
      <Alert>
        <Terminal className='h-4 w-4' />
        <AlertTitle>Кампанит ажил амжилттай үүслээ!</AlertTitle>
      </Alert>;
      router.push('/campaigns');
    } catch (err: any) {
      console.error(err);
      setError(`Алдаа: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  // Аль алхам дээр байгаагаас шалтгаалан харуулах компонент
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
    <div className='max-w-3xl mx-auto bg-white p-4 rounded shadow space-y-4 relative'>
      <h1 className='text-2xl font-bold text-gray-800'>
        Кампанит ажил үүсгэх (Wizard)
      </h1>

      <StepIndicator
        steps={WizardSteps}
        currentStep={currentStep}
        onStepClick={(stepId) => setCurrentStep(stepId)}
      />

      {/* Алдаа гарвал Alert харуулах */}
      <AnimatePresence>
        {error && (
          <motion.div
            key='error-alert'
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
          >
            <Alert variant='destructive' className='mt-2'>
              <div className='flex items-center gap-2'>
                <AlertCircle className='w-5 h-5 text-red-600' />
                <AlertTitle className='text-red-600'>Алдаа</AlertTitle>
              </div>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      <div className='relative'>
        <AnimatePresence mode='wait'>
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>

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

      {/* Loading Overlay (Анимэйшнтай) */}
      <AnimatePresence>
        {loading && (
          <motion.div
            className='absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className='bg-white rounded p-6 shadow flex items-center gap-3'
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <Loader2 className='w-6 h-6 animate-spin text-blue-600' />
              <div>
                <AlertTitle className='text-blue-600'>
                  Үүсгэж байна...
                </AlertTitle>
                <AlertDescription className='text-gray-600'>
                  Та түр хүлээнэ үү
                </AlertDescription>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
