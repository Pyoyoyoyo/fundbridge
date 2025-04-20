'use client';

import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePublicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

if (!stripePublicKey) {
  console.error(
    '❌ Stripe public key not found! Please check your .env.local file.'
  );
}

const stripePromise = stripePublicKey ? loadStripe(stripePublicKey) : null;

export default function StripeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!stripePromise) {
    return (
      <div className='p-6 text-red-600'>
        Stripe тохиргоо алдаатай байна. Админтай холбогдоно уу.
      </div>
    );
  }

  return <Elements stripe={stripePromise}>{children}</Elements>;
}
