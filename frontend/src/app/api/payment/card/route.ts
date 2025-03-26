// app/api/payment/card/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-02-24.acacia',
});

export async function POST(req: NextRequest) {
  try {
    const { cardNumber, cardHolder, cardExpiry, amountMnt } = await req.json();

    // (1) Картын мэдээллийг Stripe-т дамжуулж, токен үүсгэх (эсвэл PaymentIntent).
    // Энд demo байдлаар pseudo-code хэлбэртэй:
    // const token = await stripe.tokens.create({
    //   card: {
    //     number: cardNumber,
    //     exp_month: ...,
    //     exp_year: ...,
    //     cvc: ...,
    //   },
    // });

    // (2) Хэрэв MNT дүн оруулсан бол USD руу хөрвүүлнэ. Жишээ: 1 USD ~ 3400 MNT
    // const amountUsd = Math.round(amountMnt / 3400);

    // (3) Төлбөр (Charge) үүсгэх
    // const charge = await stripe.charges.create({
    //   amount: amountUsd * 100, // cents
    //   currency: 'usd',
    //   source: token.id,
    //   description: 'Card payment for campaign #...',
    // });

    // (4) Хэрэв амжилттай бол:
    //   - Та FundraisingContract => donate(...) дуудах эсвэл DB‐д “төлбөр амжилттай” гэж тэмдэглэж болно
    //   - charge.id, charge.status гэх мэт charge-ийн үр дүнг авч болно

    return NextResponse.json({
      success: true,
      transactionId: 'sample-12345',
    });
  } catch (err: any) {
    console.error('Card payment error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
