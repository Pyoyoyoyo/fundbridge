'use client';

import { FormEvent, useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';

export default function CardForm({
  amountMnt,
  onSuccess,
}: {
  amountMnt: number;
  onSuccess?: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) {
      alert('Stripe not loaded yet!');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // create-payment-intent
      const res = await fetch('/api/payment/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountMnt }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to create PaymentIntent');
      }
      const { clientSecret } = await res.json();

      // confirmCardPayment
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error('CardElement not found!');

      const confirmResult = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });
      if (confirmResult.error) {
        throw new Error(confirmResult.error.message);
      }
      if (confirmResult.paymentIntent?.status === 'succeeded') {
        onSuccess?.(); // төлбөр амжилттай → FundraisingContract => donate(...)
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <CardElement className='border border-gray-300 p-2 rounded' />
      {error && <p className='text-red-500'>{error}</p>}
      <button
        type='submit'
        disabled={!stripe || loading}
        className='bg-blue-600 text-white px-4 py-2 rounded'
      >
        {loading ? 'Төлбөр баталгаажуулж байна...' : 'Картаар төлбөр хийх'}
      </button>
    </form>
  );
}
