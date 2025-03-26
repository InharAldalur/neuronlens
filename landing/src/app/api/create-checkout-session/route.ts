// app/api/create-checkout-session/route.js

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getAuth } from '@clerk/nextjs/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
	const { userId } = getAuth(req);

	if (!userId) {
		return new Response('Unauthorized', { status: 401 });
	}

	try {
		const session = await stripe.checkout.sessions.create({
			payment_method_types: ['card'],
			line_items: [
				{
					price: process.env.STRIPE_PRICE_ID, // Use environment variable for price ID
					quantity: 1,
				},
			],
			mode: 'subscription',
			success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cancel`,
			client_reference_id: userId,
			metadata: {
				userId,
			},
		});

		return NextResponse.json({ sessionId: session.id });
	} catch (error) {
		console.error('Error creating checkout session:', error);
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		);
	}
}
