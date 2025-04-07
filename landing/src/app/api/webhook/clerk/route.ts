import { NextRequest, NextResponse } from 'next/server';
import { clerkClient, WebhookEvent } from '@clerk/nextjs/server';
import { headers } from 'next/headers';
import { Webhook } from 'svix';

// Define initial credits for new free users
const INITIAL_FREE_CREDITS = 5;

export async function POST(req: NextRequest) {
	// Get the Clerk webhook secret from environment variables
	const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

	if (!WEBHOOK_SECRET) {
		console.error('Missing CLERK_WEBHOOK_SECRET environment variable');
		return new NextResponse('Internal Server Error: Missing webhook secret', {
			status: 500,
		});
	}

	// Create a new Svix instance with your secret *after* checking it exists.
	const wh = new Webhook(WEBHOOK_SECRET);

	// Get the headers
	const headerPayload = headers();
	const svix_id = headerPayload.get('svix-id');
	const svix_timestamp = headerPayload.get('svix-timestamp');
	const svix_signature = headerPayload.get('svix-signature');

	// If there are no headers, return a 400
	if (!svix_id || !svix_timestamp || !svix_signature) {
		console.warn('Webhook received without required Svix headers.');
		return new NextResponse('Error occurred -- no svix headers', {
			status: 400,
		});
	}

	// Get the body
	const payload = await req.json();
	const body = JSON.stringify(payload);

	let evt: WebhookEvent;

	try {
		// Verify the webhook
		evt = wh.verify(body, {
			'svix-id': svix_id,
			'svix-timestamp': svix_timestamp,
			'svix-signature': svix_signature,
		}) as WebhookEvent;
	} catch (err) {
		console.error('Error verifying webhook:', err);
		return new NextResponse('Error occurred during webhook verification', {
			status: 400,
		});
	}

	// Handle the webhook event
	const { id } = evt.data;
	const eventType = evt.type;

	console.log(`Webhook received with ID: ${id} and Type: ${eventType}`);

	if (eventType === 'user.created') {
		console.log(`Processing user.created event for User ID: ${id}`);
		try {
			const userId = id; // User ID from the event data
			const now = new Date().toISOString();
			if (!userId) {
				console.error('User ID is undefined in webhook event');
				return new NextResponse('Invalid user ID', { status: 400 });
			}

			// Update user metadata to initialize credits using privateMetadata
			await clerkClient.users.updateUserMetadata(userId, {
				privateMetadata: {
					credits: INITIAL_FREE_CREDITS, // Set initial credits
					creditsLastReset: now, // Set initial reset date
					// plan: 'free' // Optionally set initial plan if needed later
				},
			});

			console.log(`Successfully initialized credits for user ${userId}`);
			return new NextResponse('User credits initialized', { status: 200 });
		} catch (error) {
			console.error(`Error initializing credits for user ${id}:`, error);
			// Return 200 to prevent Clerk retries, but log the error
			return new NextResponse(
				'Internal server error processing user creation',
				{ status: 200 }
			);
		}
	} else {
		// Handle other event types or ignore them
		console.log(`Ignoring webhook event type: ${eventType}`);
		return new NextResponse('Event type not handled', { status: 200 });
	}
}
