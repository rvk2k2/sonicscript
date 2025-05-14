import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    const { uid, email } = await req.json();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: '500 Credits',
              description: 'Purchase 500 transcription credits for SonicScript',
            },
            unit_amount: 499, // $4.99 in cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        uid: uid, 
        credits: 500,
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/settings?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/settings?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe session error:", err);
    return NextResponse.json({ error: "Failed to create Stripe Checkout session" }, { status: 500 });
  }
}
