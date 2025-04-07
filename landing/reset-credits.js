// A simple script to reset all user credits by calling the API endpoint
const fetch = require('node-fetch');
require('dotenv').config();

async function resetCredits() {
	const cronSecret = process.env.CRON_SECRET;

	if (!cronSecret) {
		console.error('Missing CRON_SECRET in environment variables');
		process.exit(1);
	}

	try {
		// Call the API endpoint to reset credits
		console.log('Resetting credits for all users...');

		// Use localhost if running locally or your domain in production
		const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
		const response = await fetch(`${baseUrl}/api/cron/reset-credits`, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${cronSecret}`,
			},
		});

		const data = await response.json();

		if (response.ok) {
			console.log('Successfully reset credits for all users');
			console.log(data);
		} else {
			console.error('Failed to reset credits:', data);
			process.exit(1);
		}
	} catch (error) {
		console.error('Error resetting credits:', error);
		process.exit(1);
	}
}

resetCredits()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error('Unhandled error:', error);
		process.exit(1);
	});
