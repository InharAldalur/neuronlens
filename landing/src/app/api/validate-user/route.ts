// app/api/user-status/route.js

import { NextResponse, NextRequest } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';

// Define interface for credit usage tracking
interface CreditUsage {
	[key: string]: number;
}

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

		// Get current month and year for tracking monthly usage
		const now = new Date();
		const currentMonth = now.getMonth();
		const currentYear = now.getFullYear();

		// Retrieve credit usage data from user metadata
		const creditUsage = (user.publicMetadata.creditUsage as CreditUsage) || {};
		const monthKey = `${currentYear}-${currentMonth}`;
		const currentMonthUsage = creditUsage[monthKey] || 0;
		const monthlyLimit = 5; // 5 free credits per month

		// Check if user is within free usage limit
		const withinFreeLimit = currentMonthUsage < monthlyLimit;

		return NextResponse.json({
			authenticated: true,
			paid: hasActiveSubscription,
			freeUsage: {
				withinLimit: withinFreeLimit || hasActiveSubscription,
				used: currentMonthUsage,
				limit: monthlyLimit,
				remaining: Math.max(0, monthlyLimit - currentMonthUsage),
			},
		});
	} catch (error) {
		console.error('Error fetching user data:', error);
		return NextResponse.json(
			{ authenticated: false, paid: false, error: 'Unable to fetch user data' },
			{ status: 500 }
		);
	}
}
