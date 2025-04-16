'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function KycOtpPage() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [userId, setUserId] = useState('');
  const [step, setStep] = useState<'send' | 'verify'>('send');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // ⛳️ Session-оос хэрэглэгчийн email болон id автоматаар авна
  useEffect(() => {
    async function fetchSession() {
      const res = await fetch('/api/auth/session');
      const data = await res.json();
      if (data?.user?.email) setEmail(data.user.email);
      if (data?.user?.id) setUserId(data.user.id);
    }
    fetchSession();
  }, []);

  async function sendOtp() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/kyc/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Илгээхэд алдаа гарлаа');
      setStep('verify');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/kyc/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || 'Баталгаажуулахад алдаа гарлаа');

      if (!userId) throw new Error('Хэрэглэгчийн ID олдсонгүй');

      const kycRes = await fetch('/api/kyc/create-verification-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      const kycData = await kycRes.json();
      if (!kycRes.ok || !kycData.hostedUrl) {
        throw new Error(
          kycData.error || 'Stripe баталгаажуулалт эхлүүлэхэд алдаа гарлаа'
        );
      }

      window.location.href = kycData.hostedUrl;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='max-w-md mx-auto p-6 bg-white shadow rounded mt-10 space-y-4'>
      <h1 className='text-xl font-bold text-center text-blue-600'>
        KYC баталгаажуулалт
      </h1>

      {error && (
        <Alert variant='destructive'>
          <AlertTitle>Алдаа</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {step === 'send' ? (
        <>
          <Input
            type='email'
            placeholder='И-мэйл хаяг'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled
          />
          <Button
            className='w-full bg-blue-600'
            onClick={sendOtp}
            disabled={loading}
          >
            {loading ? 'Илгээж байна...' : 'OTP илгээх'}
          </Button>
        </>
      ) : (
        <>
          <Input
            type='text'
            placeholder='6 оронтой код'
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <Button
            className='w-full bg-blue-600'
            onClick={verifyOtp}
            disabled={loading}
          >
            {loading ? 'Баталгаажуулж байна...' : 'Баталгаажуулах'}
          </Button>
        </>
      )}
    </div>
  );
}
