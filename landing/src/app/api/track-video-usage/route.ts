import { NextResponse, NextRequest } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';

// Define interface for credit usage tracking
interface CreditUsage {
	[key: string]: number;
}

export async function POST(req: NextRequest) {
	const { userId } = await req.json();

	if (!userId) {
		return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
	}

	try {
		// Fetch user data from Clerk
		const user = await clerkClient.users.getUser(userId);

		// Get current month and year for tracking
		const now = new Date();
		const currentMonth = now.getMonth();
		const currentYear = now.getFullYear();
		const monthKey = `${currentYear}-${currentMonth}`;

		// Get current usage data
		const creditUsage = (user.publicMetadata.creditUsage as CreditUsage) || {};
		const currentMonthUsage = creditUsage[monthKey] || 0;

		// Check if user has active subscription or credits left
		const hasActiveSubscription =
			user.publicMetadata.hasActiveSubscription || false;
		const monthlyLimit = 5; // 5 free credits per month

		if (!hasActiveSubscription && currentMonthUsage >= monthlyLimit) {
			return NextResponse.json(
				{
					error: 'No credits remaining',
					needsUpgrade: true,
				},
				{ status: 403 }
			);
		}

		// If user has active subscription, don't count credits
		if (!hasActiveSubscription) {
			// Update usage count
			creditUsage[monthKey] = currentMonthUsage + 1;

			// Update user metadata
			await clerkClient.users.updateUser(userId, {
				publicMetadata: {
					...user.publicMetadata,
					creditUsage,
				},
			});
		}

		return NextResponse.json({
			success: true,
			updated: {
				monthKey,
				usageCount: hasActiveSubscription ? 'unlimited' : creditUsage[monthKey],
				remaining: hasActiveSubscription
					? 'unlimited'
					: Math.max(0, monthlyLimit - creditUsage[monthKey]),
			},
		});
	} catch (error) {
		console.error('Error updating credit usage:', error);
		return NextResponse.json(
			{ error: 'Failed to update credit usage' },
			{ status: 500 }
		);
	}
}
