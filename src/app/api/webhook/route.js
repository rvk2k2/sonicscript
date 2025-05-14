import { NextResponse } from "next/server";
import { buffer } from "micro";
import Stripe from "stripe";
import { adminDb } from "@/lib/firebase-admin";
import { doc, updateDoc, increment } from "firebase/firestore";
import admin from "firebase-admin";

export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req) {
  const buf = await req.arrayBuffer();
  const rawBody = Buffer.from(buf);
  const sig = req.headers.get("stripe-signature");

  let event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Webhook Error" }, { status: 400 });
  }

  // Handle the checkout.session.completed event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const uid = session.metadata?.uid;
    
    if (!uid) {
  console.error("Missing userId in Stripe metadata");
  return NextResponse.json({ error: "Missing userId" }, { status: 400 });

}


const creditsRef = adminDb.doc(`users/${uid}/credits/balance`);

    try {

await adminDb.runTransaction(async (transaction) => {
  const docSnap = await transaction.get(creditsRef);
  const currentCredits = docSnap.exists ? docSnap.data().totalCredits : 0;
  const newCredits = currentCredits + 500;

  transaction.set(creditsRef, {
    totalCredits: newCredits,
    lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
  });
});

      console.log(`✅ Added 500 credits to UID: ${uid}`);
    return NextResponse.json({ success: true }, { status: 200 });

  } catch (err) {
    console.error("❌ Error updating credits:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });

  }
}

  return NextResponse.json({ received: true });
}
