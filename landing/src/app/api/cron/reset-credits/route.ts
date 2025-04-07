import { NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';

// Define interface for credit usage tracking
interface CreditUsage {
	[key: string]: number;
}

// This function resets credits for all users at the beginning of each month
export async function GET(req: Request) {
	// Check for authorization - you might want to secure this endpoint with a secret
	const authHeader = req.headers.get('authorization');
	const expectedToken = process.env.CRON_SECRET;

	// Simple authorization
	if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
		return new Response('Unauthorized', { status: 401 });
	}

	try {
		// Get current month and year
		const now = new Date();
		const currentMonth = now.getMonth();
		const currentYear = now.getFullYear();
		const monthKey = `${currentYear}-${currentMonth}`;

		// Get all users from Clerk (paginate as needed)
		const { data: users } = await clerkClient.users.getUserList({
			limit: 100,
		});

		let updatedCount = 0;
		let errorCount = 0;

		// Process each user and reset their credits for the new month
		for (const user of users) {
			try {
				// Get existing credit usage data (if any)
				const creditUsage =
					(user.publicMetadata.creditUsage as CreditUsage) || {};

				// Reset credit count for current month (or initialize if it doesn't exist)
				creditUsage[monthKey] = 0;

				// Update user's metadata with reset credits
				await clerkClient.users.updateUser(user.id, {
					publicMetadata: {
						...user.publicMetadata,
						creditUsage,
					},
				});

				updatedCount++;
			} catch (userError) {
				console.error(`Error updating user ${user.id}:`, userError);
				errorCount++;
			}
		}

		return NextResponse.json({
			success: true,
			message: `Credits reset for ${updatedCount} users`,
			errors: errorCount,
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		console.error('Error resetting credits:', error);
		return NextResponse.json(
			{
				success: false,
				error: 'Failed to reset credits',
				message: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		);
	}
}
