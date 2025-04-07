// Import using ES module syntax
import { clerkClient } from '@clerk/nextjs/server';
import * as dotenv from 'dotenv';

// Initialize dotenv
dotenv.config();

// Define interface for credit usage tracking
interface CreditUsage {
	[key: string]: number;
}

/**
 * This script resets the credits for all users.
 * It can be run manually when needed or used for testing.
 *
 * Run with: npx ts-node -r dotenv/config src/scripts/reset-all-credits.ts
 */
async function resetAllCredits() {
	try {
		console.log('Starting credit reset for all users...');

		// Get current month and year
		const now = new Date();
		const currentMonth = now.getMonth();
		const currentYear = now.getFullYear();
		const monthKey = `${currentYear}-${currentMonth}`;

		// Get all users from Clerk (paginate as needed)
		const { data: users } = await clerkClient.users.getUserList({
			limit: 100,
		});

		console.log(`Found ${users.length} users to process`);

		let updatedCount = 0;
		let errorCount = 0;

		// Process each user and reset their credits for the new month
		for (const user of users) {
			try {
				console.log(
					`Processing user: ${user.id} (${
						user.emailAddresses[0]?.emailAddress || 'no email'
					})`
				);

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

				console.log(`Successfully reset credits for user: ${user.id}`);
				updatedCount++;
			} catch (userError) {
				console.error(`Error updating user ${user.id}:`, userError);
				errorCount++;
			}
		}

		console.log('Credit reset completed:');
		console.log(`- Updated: ${updatedCount} users`);
		console.log(`- Errors: ${errorCount} users`);
		console.log(`- Current month key: ${monthKey}`);
	} catch (error) {
		console.error('Error in reset script:', error);
		process.exit(1);
	}
}

// Run the script if executed directly
// In ES modules, there's no direct equivalent to require.main === module
// So we export the function and run it directly when needed
export { resetAllCredits };

// Execute the script
resetAllCredits()
	.then(() => {
		console.log('Script completed successfully');
		process.exit(0);
	})
	.catch((error) => {
		console.error('Script failed:', error);
		process.exit(1);
	});
