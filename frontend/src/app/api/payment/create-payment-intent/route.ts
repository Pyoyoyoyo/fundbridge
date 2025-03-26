// app/api/payment/create-payment-intent/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-02-24.acacia',
});

export async function POST(req: NextRequest) {
  try {
    const { amountMnt } = await req.json();
    if (!amountMnt || amountMnt <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    // (1) MNT -> USD (жишээ ханш: 1 USD ~ 3400 MNT)
    const amountUsd = Math.round(amountMnt / 3400);
    // Stripe‐ийн зоослог (cents) дээр дамжуулах
    const amountInCents = amountUsd * 100;

    // (2) PaymentIntent үүсгэх
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      // Төлбөрийн тайлбар
      description: `Donation for campaign`,
      // Автоматаар confirm хийхийг хүсвэл, confirm=true гэх мэт параметр нэмж болно
    });

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err: any) {
    console.error('Create PaymentIntent error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
