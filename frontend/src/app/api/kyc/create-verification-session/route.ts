// src/app/api/kyc/create-verification-session/route.ts
import Stripe from 'stripe';
import { NextRequest } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return new Response(JSON.stringify({ error: 'userId is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Stripe Identity Verification Session үүсгэх
    const session = await stripe.identity.verificationSessions.create({
      type: 'document',
      metadata: {
        userId, // хэрэглэгчтэй холбох
      },
      return_url: `${process.env.NEXTAUTH_URL}/kyc/success`,
    });

    return new Response(JSON.stringify({ hostedUrl: session.url }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Stripe Identity session error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
