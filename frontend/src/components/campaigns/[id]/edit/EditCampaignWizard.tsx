'use client';

import { useState } from 'react';
import { BrowserProvider, ethers } from 'ethers';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

import StepIndicator from '@/components/SharedComponents/StepIndicator';
import {
  File,
  Gift,
  BookOpen,
  Users,
  CreditCard,
  Megaphone,
} from 'lucide-react';

import BasicsStep from '@/components/campaigns/create/steps/BasicsStep';
import RewardsStep from '@/components/campaigns/create/steps/RewardsStep';
import StoryStep from '@/components/campaigns/create/steps/StoryStep';
import PeopleStep from '@/components/campaigns/create/steps/PeopleStep';
import PaymentStep from '@/components/campaigns/create/steps/PaymentStep';
import PromotionStep from '@/components/campaigns/create/steps/PromotionStep';

import type { FormData } from '@/app/interfaces';
import { getFundraisingContract } from '@/services/fundraisingConfig';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TOTAL_STEPS = 6;

const WizardSteps = [
  { id: 1, title: 'Үндсэн мэдээлэл', icon: <File className='w-4 h-4' /> },
  { id: 2, title: 'Шагнал', icon: <Gift className='w-4 h-4' /> },
  { id: 3, title: 'Төслийн түүх', icon: <BookOpen className='w-4 h-4' /> },
  { id: 4, title: 'Хувийн мэдээлэл', icon: <Users className='w-4 h-4' /> },
  { id: 5, title: 'Төлбөр', icon: <CreditCard className='w-4 h-4' /> },
  { id: 6, title: 'Сурталчилгаа', icon: <Megaphone className='w-4 h-4' /> },
];

interface Props {
  campaignId: number;
  initialFormData: FormData; // contract + IPFS‐ээс авсан өгөгдөл
}

export default function EditCampaignWizard({
  campaignId,
  initialFormData,
}: Props) {
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [currentStep, setCurrentStep] = useState(1);

  // Loading, error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateFormData(fields: Partial<FormData>) {
    setFormData((prev) => ({ ...prev, ...fields }));
  }

  // Алхам тус бүрд validation хийж болно
  function validateStep(step: number): boolean {
    return true;
  }

  async function handleNext() {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
    }
  }

  function prevStep() {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  }

  // ------------------------------------------------
  // Finish -> updateCampaign(...), дараа нь /profile/campaigns рүү
  // ------------------------------------------------
  async function handleFinish() {
    try {
      setLoading(true);
      setError(null);

      // 1) formData‐г IPFS рүү update хийж, шинэ CID авна
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

      // 2) Ердийн updateCampaign дуудаж, title, description, imageUrl, metadataHash солих
      if (!window.ethereum) {
        alert('MetaMask not found!');
        return;
      }
      const provider = new BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const contract = getFundraisingContract(signer);

      // formData.basics.title, .description, .imageUrl‐ыг ашиглана
      const newTitle = formData.basics.title || '';
      const newDesc = formData.basics.description || '';
      const newImageUrl = formData.basics.imageUrl || '';
      const newMetadataHash = cid; // IPFS дээрх шинэ metadata

      const tx = await contract.updateCampaign(
        campaignId,
        newTitle,
        newDesc,
        newImageUrl,
        newMetadataHash
      );
      await tx.wait();

      alert('Кампанит ажлын мэдээлэл амжилттай шинэчлэгдлээ!');
      // ЭНД /profile/campaigns рүү шилжүүлэх
      router.push('/profile/campaigns');
    } catch (err: any) {
      console.error(err);
      setError(`Алдаа: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

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
        Кампанит ажил засварлах (ID: {campaignId})
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
            {loading ? 'Шинэчилж байна...' : 'Дуусгах'}
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
                  Шинэчилж байна...
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
