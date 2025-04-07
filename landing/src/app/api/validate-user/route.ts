// app/api/user-status/route.ts

import { NextResponse, NextRequest } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';

// --- Constants ---
const FREE_CREDITS_PER_MONTH = 5;
const PAID_CREDITS_PER_MONTH = 50; // New constant for paid users

// --- Helper Functions ---
function getStartOfNextMonthTimestamp(): number {
	const now = new Date();
	const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
	return nextMonth.getTime();
}

// --- API Route ---
export async function POST(req: NextRequest) {
	const { userId, decrement = false } = await req.json();

	if (!userId) {
		// Not authenticated
		return NextResponse.json({ hasCredits: false, creditsRemaining: 0 });
	}

	try {
		const user = await clerkClient.users.getUser(userId);

		// 1. Determine Credit Limit based on Subscription Status
		const hasActiveSubscription =
			user.publicMetadata?.hasActiveSubscription === true;
		const creditLimit = hasActiveSubscription
			? PAID_CREDITS_PER_MONTH
			: FREE_CREDITS_PER_MONTH;

		// 2. Handle Credits (Reset, Initialize, Get Current)
		let credits = (user.privateMetadata?.credits as number) ?? null;
		let resetTimestamp =
			(user.privateMetadata?.creditResetTimestamp as number) ?? null;
		const now = Date.now();
		let metadataNeedsUpdate = false;

		// Initialize credits/timestamp if missing or reset if time has passed
		if (resetTimestamp === null || now >= resetTimestamp) {
			credits = creditLimit; // Use the determined credit limit
			resetTimestamp = getStartOfNextMonthTimestamp();
			metadataNeedsUpdate = true;
			console.log(`User ${userId}: Credits reset/initialized to ${credits} (Limit: ${creditLimit}). Next reset: ${new Date(resetTimestamp).toISOString()}`);
		}

		// Ensure credits are never null after potential reset/initialization (Fallback)
		if (credits === null) {
			credits = creditLimit; // Use the determined credit limit
			if (resetTimestamp === null) resetTimestamp = getStartOfNextMonthTimestamp();
			metadataNeedsUpdate = true;
			console.log(`User ${userId}: Fallback - Initializing credits to ${credits} (Limit: ${creditLimit}).`);
		}

		let currentCredits = credits;
		const hasEnoughCredits = currentCredits > 0;

		// 3. Decrement credits if requested and available
		if (decrement && hasEnoughCredits) {
			currentCredits -= 1;
			metadataNeedsUpdate = true;
			console.log(`User ${userId}: Decrementing credit. Remaining: ${currentCredits}/${creditLimit}`);
		}

		// 4. Update Clerk metadata if needed
		if (metadataNeedsUpdate) {
			try {
				await clerkClient.users.updateUserMetadata(userId, {
					privateMetadata: {
						...(user.privateMetadata || {}),
						credits: currentCredits,
						creditResetTimestamp: resetTimestamp,
					},
				});
			} catch (updateError) {
				console.error(`User ${userId}: Failed to update Clerk metadata:`, updateError);
				// If decrement failed, return error
				if (decrement && hasEnoughCredits) {
					return NextResponse.json(
						{
							hasCredits: false,
							creditsRemaining: credits, // Return original credits before failed decrement
							error: 'Failed to update credits. Please try again.',
						},
						{ status: 500 }
					);
				}
				// Log other update errors but proceed if possible
			}
		}

		// 5. Return status
		const finalHasCredits = currentCredits > 0;
		return NextResponse.json({
			hasCredits: finalHasCredits,
			creditsRemaining: currentCredits,
		});

	} catch (error) {
		console.error(`User ${userId}: Error fetching user data or processing credits:`, error);
		return NextResponse.json(
			{
				hasCredits: false,
				creditsRemaining: 0,
				error: 'Unable to validate user status',
			},
			{ status: 500 }
		);
	}
}
