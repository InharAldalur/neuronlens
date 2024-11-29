// app/api/user-status/route.js

import { NextResponse, NextRequest } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';

export async function POST(req: NextRequest) {
	const { userId } = await req.json();
	// Get the authenticated user's ID

	if (!userId) {
		// User is not authenticated
		return NextResponse.json({ authenticated: false, paid: false });
	}

	try {
		// Fetch user data from Clerk
		const user = await clerkClient.users.getUser(userId);

		// Check if the user has paid
		// Assuming you store payment status in publicMetadata
		const hasActiveSubscription =
			user.publicMetadata.hasActiveSubscription || false;

		return NextResponse.json({
			authenticated: true,
			paid: hasActiveSubscription,
		});
	} catch (error) {
		console.error('Error fetching user data:', error);
		return NextResponse.json(
			{ authenticated: false, paid: false, error: 'Unable to fetch user data' },
			{ status: 500 }
		);
	}
}
