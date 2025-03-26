import { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { clerkClient } from '@clerk/nextjs/server';
import { headers } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

interface StripeMetadata {
	stripeCustomerId?: string;
	[key: string]: string | boolean | number | undefined;
}

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
				// Get the current user data to preserve existing metadata
				const user = await clerkClient.users.getUser(userId);

				await clerkClient.users.updateUserMetadata(userId, {
					publicMetadata: {
						...user.publicMetadata, // Preserve existing metadata
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
		const customerId = subscription.customer as string;

		try {
			// Find user by Stripe customer ID or use metadata
			const userId =
				subscription.metadata?.userId ||
				(await findUserByStripeCustomerId(customerId));

			if (userId) {
				const user = await clerkClient.users.getUser(userId);

				await clerkClient.users.updateUserMetadata(userId, {
					publicMetadata: {
						...user.publicMetadata, // Preserve existing metadata
						hasActiveSubscription: false,
					},
				});
				console.log(`Updated user ${userId} with cancelled subscription`);
			}
		} catch (error) {
			console.error('Error updating user metadata:', error);
			return new Response('Error updating user metadata', { status: 500 });
		}
	}

	if (event.type === 'customer.subscription.updated') {
		const subscription = event.data.object as Stripe.Subscription;
		const customerId = subscription.customer as string;

		try {
			// Find user by Stripe customer ID or use metadata
			const userId =
				subscription.metadata?.userId ||
				(await findUserByStripeCustomerId(customerId));

			if (userId) {
				const user = await clerkClient.users.getUser(userId);

				await clerkClient.users.updateUserMetadata(userId, {
					publicMetadata: {
						...user.publicMetadata, // Preserve existing metadata
						hasActiveSubscription: true,
					},
				});
				console.log(`Updated user ${userId} with updated subscription`);
			}
		} catch (error) {
			console.error('Error updating user metadata:', error);
			return new Response('Error updating user metadata', { status: 500 });
		}
	}

	return new Response('Webhook processed', { status: 200 });
}

// Helper function to find a user by Stripe customer ID
async function findUserByStripeCustomerId(
	customerId: string
): Promise<string | null> {
	try {
		// Get list of users from Clerk
		const userList = await clerkClient.users.getUserList({
			limit: 100,
		});

		// Find user with matching Stripe customer ID
		for (const user of userList.data) {
			const metadata = user.publicMetadata as StripeMetadata;
			if (metadata.stripeCustomerId === customerId) {
				return user.id;
			}
		}

		return null;
	} catch (error) {
		console.error('Error finding user by Stripe customer ID:', error);
		return null;
	}
}
