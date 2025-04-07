import { NextResponse, NextRequest } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';

// Define interface for video usage tracking
interface VideoUsage {
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
		const videoUsage = (user.publicMetadata.videoUsage as VideoUsage) || {};
		const currentMonthUsage = videoUsage[monthKey] || 0;

		// Update usage count
		videoUsage[monthKey] = currentMonthUsage + 1;

		// Update user metadata
		await clerkClient.users.updateUser(userId, {
			publicMetadata: {
				...user.publicMetadata,
				videoUsage,
			},
		});

		return NextResponse.json({
			success: true,
			updated: {
				monthKey,
				usageCount: videoUsage[monthKey],
			},
		});
	} catch (error) {
		console.error('Error updating video usage:', error);
		return NextResponse.json(
			{ error: 'Failed to update video usage' },
			{ status: 500 }
		);
	}
}
