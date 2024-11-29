import { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { clerkClient } from '@clerk/nextjs/server';
import { headers } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
	const body = await req.text();
	const signature = headers().get('Stripe-Signature') as string;

	let event: Stripe.Event;

	try {
		event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
	} catch (err) {
		console.error('Webhook signature verification failed:', err);
		return new Response('Invalid signature', { status: 400 });
	}

	if (event.type === 'checkout.session.completed') {
		const session = event.data.object as Stripe.Checkout.Session;
		const userId = session.client_reference_id;

		if (userId) {
			try {
				await clerkClient.users.updateUserMetadata(userId, {
					publicMetadata: {
						hasActiveSubscription: true,
					},
				});
				console.log(`Updated user ${userId} with active subscription`);
			} catch (error) {
				console.error('Error updating user metadata:', error);
				return new Response('Error updating user metadata', { status: 500 });
			}
		}
	}

	if (event.type === 'customer.subscription.deleted') {
		const subscription = event.data.object as Stripe.Subscription;
		const userId = subscription.customer as string;
		try {
			await clerkClient.users.updateUserMetadata(userId, {
				publicMetadata: {
					hasActiveSubscription: false,
				},
			});
			console.log(`Updated user ${userId} with active subscription`);
		} catch (error) {
			console.error('Error updating user metadata:', error);
			return new Response('Error updating user metadata', { status: 500 });
		}
	}

	if (event.type === 'customer.subscription.updated') {
		const subscription = event.data.object as Stripe.Subscription;
		const userId = subscription.customer as string;
		try {
			await clerkClient.users.updateUserMetadata(userId, {
				publicMetadata: {
					hasActiveSubscription: true,
				},
			});
			console.log(`Updated user ${userId} with active subscription`);
		} catch (error) {
			console.error('Error updating user metadata:', error);
			return new Response('Error updating user metadata', { status: 500 });
		}
	}

	return new Response('Webhook processed', { status: 200 });
}
